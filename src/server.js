import { AutoRouter } from 'itty-router';
import {
  InteractionResponseType,
  InteractionType,
  verifyKey,
} from 'discord-interactions';
import { METIERS_COMMAND } from './commands.js';
import * as Queries from './queries.js';
import { postMessage, patchMessage } from './api.js';
import { InteractionResponseFlags, MessageComponentTypes } from 'discord-interactions';

class JsonResponse extends Response {
  constructor(body, init) {
    const jsonBody = JSON.stringify(body);
    init = init || {
      headers: {
        'content-type': 'application/json;charset=UTF-8',
      },
    };
    super(jsonBody, init);
  }
}

const router = AutoRouter();

/**
 * A simple :wave: hello page to verify the worker is working.
 */
router.get('/', (request, env) => {
  return new Response(`👋 ${env.DISCORD_APPLICATION_ID}`);
});

/**
 * Main route for all requests sent from Discord.  All incoming messages will
 * include a JSON payload described here:
 * https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object
 */
router.post('/', async (request, env) => {
  const { isValid, interaction } = await server.verifyDiscordRequest(
    request,
    env,
  );
  if (!isValid || !interaction) {
    return new Response('Bad request signature.', { status: 401 });
  }

  if (interaction.type === InteractionType.PING) {
    // The `PING` message is used during the initial webhook handshake, and is
    // required to configure the webhook in the developer portal.
    return new JsonResponse({
      type: InteractionResponseType.PONG,
    });
  }

  const professions = await Queries.findAllProfesssions();

  let professionButtons = [];

  professions.forEach((p) => {
    professionButtons.push({
        type: MessageComponentTypes.BUTTON,
        label: p.name,
        custom_id: 'profession_'+p.id,
        emoji: {
          id: null,
          name: p.emoji
        },
        style: 1
    })
  });

  let componentProfessions = [
    {
        type: MessageComponentTypes.SEPARATOR,
        divider: true,
        spacing: 1,
    },
    {
      type: MessageComponentTypes.TEXT_DISPLAY,
      content: 'Métiers de craft :',
    },
    {
      type: MessageComponentTypes.ACTION_ROW,
      components: professionButtons.slice(0, 5),
    },
    {
      type: MessageComponentTypes.ACTION_ROW,
      components: professionButtons.slice(5, 8),
    },
    {
      type: MessageComponentTypes.TEXT_DISPLAY,
      content: 'Métiers de collecte :',
    },
    {
      type: MessageComponentTypes.ACTION_ROW,
      components: professionButtons.slice(8, 11),
    },
    {
      type: MessageComponentTypes.TEXT_DISPLAY,
      content: 'Métiers autres :',
    },
    {
      type: MessageComponentTypes.ACTION_ROW,
      components: professionButtons.slice(11),
    }
  ];

  if (interaction.type === InteractionType.APPLICATION_COMMAND) {
    // Most user commands will come as `APPLICATION_COMMAND`.
    switch (interaction.data.name.toLowerCase()) {
        case METIERS_COMMAND.name.toLowerCase(): {
            if (interaction.data.options[0].name.toLowerCase() === 'init') {
                console.log(interaction.data.options[0].options[0].value);
                const container = await listProfessions("patch");
                const messageId = await postMessage(interaction.channel.id, {
                    flags: InteractionResponseFlags.IS_COMPONENTS_V2,
                    components: container
                });
                await Queries.createVersion(interaction.data.options[0].options[0].value, interaction.channel.id, messageId)
            }
            return new JsonResponse({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                    flags: InteractionResponseFlags.EPHEMERAL,
                    content: "Version initialisée avec succès"
                }
            });
        }
        default:
            return new JsonResponse({ error: 'Unknown Type' }, { status: 400 });
    }
  }

  if (interaction.type === InteractionType.MESSAGE_COMPONENT) {
    if (interaction.data.custom_id === 'add_profession') {
        return new JsonResponse({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
                flags: InteractionResponseFlags.IS_COMPONENTS_V2 | InteractionResponseFlags.EPHEMERAL,
                components: componentProfessions
            }
        });
    }

    if (interaction.data.custom_id.startsWith('profession_')) {
        const professionId = interaction.data.custom_id.split('_')[1];
        console.log(professionId);

        const specializations = await Queries.findAllSpecializationsByProfessionId(professionId);
        console.log(specializations)

        let specializationOptions = [];

        specializations.forEach((s) => {
            specializationOptions.push(
                {
                  label: s.name,
                  value: s.id
                }
            );
        });

        return new JsonResponse({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
                flags: InteractionResponseFlags.IS_COMPONENTS_V2 | InteractionResponseFlags.EPHEMERAL,
                components: [
                    {
                      type: MessageComponentTypes.TEXT_DISPLAY,
                      content: 'Choisissez les spécialisations du métier : ',
                    },
                    {
                      type: MessageComponentTypes.ACTION_ROW,
                      components: [
                        {
                          type: MessageComponentTypes.STRING_SELECT,
                          custom_id: 'specialization_'+professionId,
                          placeholder: 'Sélectionnez le/les spécialisations',
                          options: specializationOptions,
                          min_values: 1,
                          max_values: specializationOptions.length
                        },
                      ],
                    },
                ],
            }
        });
    }

    if (interaction.data.custom_id.startsWith('specialization_')) {
        const resultsUser = await Queries.findUserByDiscordId(interaction.member.user.id);
        let userId;
        if (resultsUser.length == 0) {
            userId = await Queries.createUser(interaction.member.user.id, interaction.member.user.global_name);
        } else {
            userId = resultsUser[0].id;
        }


        const professionId = interaction.data.custom_id.split('_')[1];
        const version = await Queries.findLastVersion(interaction.channel.id);

        await Queries.deleteProfessionAndSpecializationFromUser(userId, professionId, version.id);
        await Promise.all(interaction.data.values.map(async (v) => {
            await Queries.addProfessionAndSpecializationToUser(userId, professionId, parseInt(v), version.id);
        }));
        const container = await listProfessions(version.id);
        const messageId = await patchMessage(interaction.channel.id, version.discord_message_id, {
            flags: InteractionResponseFlags.IS_COMPONENTS_V2,
            components: container
        });

        return new JsonResponse({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
                flags: InteractionResponseFlags.EPHEMERAL,
                content: "Métier mis à jour"
            }
        });
    }
  }

  console.error('Unknown Type');
  return new JsonResponse({ error: 'Unknown Type' }, { status: 400 });
});
router.all('*', () => new Response('Not Found.', { status: 404 }));

async function verifyDiscordRequest(request, env) {
  const signature = request.headers.get('x-signature-ed25519');
  const timestamp = request.headers.get('x-signature-timestamp');
  const body = await request.text();
  const isValidRequest =
    signature &&
    timestamp &&
    (await verifyKey(body, signature, timestamp, env.DISCORD_PUBLIC_KEY));
  if (!isValidRequest) {
    return { isValid: false };
  }

  return { interaction: JSON.parse(body), isValid: true };
}

const server = {
  verifyDiscordRequest,
  fetch: router.fetch,
};

export default server;

async function listProfessions(versionId) {
    const professions = await Queries.findAllProfesssions();
    const liste = await Queries.findProfessionsAndSpecializationsByUsersByVersion(versionId);
    let content = "";

    professions.forEach((p) => {
        const byProfession = liste.filter(l => l.profession_id == p.id);
        let count = 0;
        const groupedByUser = byProfession.reduce((group, user) => {
            const { user_discord_id } = user;
            
            // Initialize the group if it doesn't exist
            if (!group[user_discord_id]) {
                group[user_discord_id] = [];
                count += 1;
            }
 
            group[user_discord_id].push(user.specialization_name);
            return group;
        }, {});

        content += "### " + p.emoji + " " + p.name + " (" + count + ")" + "\n";

        for (const [key, value] of Object.entries(groupedByUser)) {
            content += `<@${key}>` + " " + "(" + value.join(', ') + ")\n";
        }
    });

    return [
        {
            type: MessageComponentTypes.CONTAINER,
            accent_color: 703487,
            components: [
                {
                    type: MessageComponentTypes.TEXT_DISPLAY,
                    content: "# Liste des artisans Menfoutistes\n" + content
                },
            ]
        },
        {
            type: MessageComponentTypes.ACTION_ROW,
            components: [
                {
                    type: MessageComponentTypes.BUTTON,
                    label: 'Ajouter',
                    custom_id: 'add_profession',
                    style: 1
                }
            ]
        },
    ];
}