// Command to choose professions
export const METIERS_COMMAND = {
    name: 'metiers',
    description: 'Gestion des métiers',
    options: [
        {
            type: 1,
            name: 'init',
            description: 'Initialiser le post',
            options: [
                {
                    type: 3,
                    name: 'version',
                    description: 'Version du jeu pour l\'init',
                }
            ],
        }
    ],
    type: 1,
};

export const ALL_COMMANDS = [METIERS_COMMAND];
