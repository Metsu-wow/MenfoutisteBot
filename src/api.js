import { env } from "cloudflare:workers";

const token = env.DISCORD_TOKEN;
const applicationId = env.DISCORD_APPLICATION_ID;

if (!token) {
  throw new Error('The DISCORD_TOKEN environment variable is required.');
}
if (!applicationId) {
  throw new Error(
    'The DISCORD_APPLICATION_ID environment variable is required.',
  );
}

const url = `https://discord.com/api/v10/channels`;

export async function postMessage(channelId, body) {
    const response = await fetch(url + "/" + channelId + "/messages", {
    headers: {
        'Content-Type': 'application/json',
        Authorization: `Bot ${token}`,
    },
    method: 'POST',
    body: JSON.stringify(body),
    });

    if (response.ok) {
        console.log('Message sent');
        const data = await response.json();
        console.log(JSON.stringify(data, null, 2));

        return data.id;
    } else {
        console.error('Error sending message');
        let errorText = `Error sending message \n ${response.url}: ${response.status} ${response.statusText}`;
        try {
            const error = await response.text();
            if (error) {
            errorText = `${errorText} \n\n ${error}`;
            }
        } catch (err) {
            console.error('Error reading body from request:', err);
        }
        console.error(errorText);
    }
}

export async function patchMessage(channelId, messageId, body) {
    const response = await fetch(url + "/" + channelId + "/messages/" + messageId, {
    headers: {
        'Content-Type': 'application/json',
        Authorization: `Bot ${token}`,
    },
    method: 'PATCH',
    body: JSON.stringify(body),
    });

    if (response.ok) {
        console.log('Message updated');
        const data = await response.json();
        console.log(JSON.stringify(data, null, 2));

        return data.id;
    } else {
        console.error('Error updating message');
        let errorText = `Error updating message \n ${response.url}: ${response.status} ${response.statusText}`;
        try {
            const error = await response.text();
            if (error) {
            errorText = `${errorText} \n\n ${error}`;
            }
        } catch (err) {
            console.error('Error reading body from request:', err);
        }
        console.error(errorText);
    }
}