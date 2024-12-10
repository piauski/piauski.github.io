const button_ids: string[] = [
    "tl",
    "tm",
    "tr",
    "ml",
    "mm",
    "mr",
    "bl",
    "bm",
    "br",
];

type Player = "X" | "O";
const player: Player = "X";
const player_color = "#aa0000";

const enemy: Player = "O";
const enemy_color = "#0000aa";

const turn_indicator = document.getElementById(
    "game-turn",
) as HTMLParagraphElement;

const result_indicator = document.getElementById(
    "game-result",
) as HTMLParagraphElement;

let player_turn = true;
let game_over = false;
let player_won = false;
let enemy_won = false;

function setButton(button: HTMLButtonElement, is_player: boolean) {
    if (
        button.textContent !== "" ||
        (is_player && !player_turn) ||
        (!is_player && player_turn)
    ) {
        return;
    }

    if (is_player && player_turn) {
        button.textContent = player;
        button.style.color = player_color;
    } else if (!is_player && !player_turn) {
        button.textContent = enemy;
        button.style.color = enemy_color;
    }
    button.disabled = true;
    player_turn = !player_turn;
    turn_indicator.textContent =
        "Current turn: " + (player_turn ? "Player" : "Computer");
}

function computerTurn(buttons: Map<string, HTMLButtonElement>): Promise<void> {
    return new Promise((resolve, reject) => {
        setTimeout(
            () => {
                if (game_over) {
                    reject("game-over");
                } else {
                    const available_buttons = Array.from(
                        buttons.entries(),
                    ).filter(([_button_id, button]) => {
                        return button.textContent === "";
                    });
                    // 0..1
                    // 0..length
                    if (available_buttons.length === 0) {
                        reject("out-of-buttons");
                    } else {
                        const random_button =
                            available_buttons[
                                Math.floor(
                                    Math.random() * available_buttons.length,
                                )
                            ];
                        setButton(random_button[1], false);
                        resolve();
                    }
                }
            },
            Math.random() * 500 + 500,
        );
    });
}

function checkForVictory(
    buttons: Map<string, HTMLButtonElement>,
): Promise<string> {
    return new Promise((resolve, reject) => {
        const grid: HTMLButtonElement[] = Array.from(buttons.values());
        // Check - rows
        for (let y = 0; y < 3; ++y) {
            const button = grid[y * 3 + 0];
            const button2 = grid[y * 3 + 1];
            const button3 = grid[y * 3 + 2];
            if (
                button.textContent !== "" &&
                button.textContent === button2.textContent &&
                button2.textContent === button3.textContent
            ) {
                resolve("victory" + button.textContent);
            }
        }
        // Check | cols
        for (let x = 0; x < 3; ++x) {
            const button = grid[0 * 3 + x];
            const button2 = grid[1 * 3 + x];
            const button3 = grid[2 * 3 + x];
            if (
                button.textContent !== "" &&
                button.textContent === button2.textContent &&
                button2.textContent === button3.textContent
            ) {
                resolve("victory" + button.textContent);
            }
        }

        // Check \ diagonal
        let button = grid[0 * 3 + 0];
        let button2 = grid[1 * 3 + 1];
        let button3 = grid[2 * 3 + 2];
        if (
            button.textContent !== "" &&
            button.textContent === button2.textContent &&
            button2.textContent === button3.textContent
        ) {
            resolve("victory" + button.textContent);
        }

        // Check / diagonal
        button = grid[2 * 3 + 0];
        button2 = grid[1 * 3 + 1];
        button3 = grid[0 * 3 + 2];
        if (
            button.textContent !== "" &&
            button.textContent === button2.textContent &&
            button2.textContent === button3.textContent
        ) {
            resolve("victory" + button.textContent);
        }

        reject("ongoing");
    });
}

const game = () => {
    let buttons = new Map<string, HTMLButtonElement>();

    for (const button_id of button_ids) {
        const button = document.getElementById(button_id) as HTMLButtonElement;
        button.textContent = "";
        buttons.set(button_id, button);
    }
    player_turn = true;
    game_over = false;
    player_won = false;
    enemy_won = false;

    turn_indicator.textContent =
        "Current turn: " + (player_turn ? "Player" : "Computer");
    result_indicator.textContent = "The game is ongoing...";

    for (const button of buttons) {
        const finish_game = async (state: string) => {
            if (state === "victoryX") {
                game_over = true;
                if (player === "X") {
                    player_won = true;
                    enemy_won = false;
                } else {
                    player_won = false;
                    enemy_won = true;
                }
            } else if (state === "victoryO") {
                game_over = true;
                if (player === "O") {
                    player_won = true;
                    enemy_won = false;
                } else {
                    player_won = false;
                    enemy_won = true;
                }
            }

            // disconnect click handler
            //button[1].onclick = null;

            turn_indicator.textContent = "Current turn: Game Over!";
            result_indicator.textContent = player_won
                ? "The game is a victory!"
                : enemy_won
                  ? "The game is a loss :("
                  : "The game is a stalemate...";
        };

        const do_click = async () => {
            if (game_over) {
                return;
            }
            setButton(button[1], true);

            await checkForVictory(buttons)
                // Resolves when someone wins.
                .then(finish_game)
                // Rejects when game is still ongoing.
                .catch((error) => {
                    console.log(error);
                });

            await computerTurn(buttons).catch(finish_game);

            await checkForVictory(buttons)
                // Resolves when someone wins.
                .then(finish_game)
                // Rejects when game is still ongoing.
                .catch((error) => {
                    console.log(error);
                });
        };
        button[1].onclick = do_click;
    }
};

window.onload = game;
