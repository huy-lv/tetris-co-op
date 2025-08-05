const ANIMAL_NAMES = [
  "Tiger",
  "Lion",
  "Elephant",
  "Panda",
  "Koala",
  "Kangaroo",
  "Dolphin",
  "Whale",
  "Shark",
  "Eagle",
  "Hawk",
  "Owl",
  "Wolf",
  "Fox",
  "Bear",
  "Rabbit",
  "Deer",
  "Horse",
  "Cat",
  "Dog",
  "Monkey",
  "Giraffe",
  "Zebra",
  "Rhino",
  "Hippo",
  "Crocodile",
  "Turtle",
  "Penguin",
  "Seal",
  "Otter",
  "Cheetah",
  "Leopard",
  "Jaguar",
  "Lynx",
  "Bobcat",
  "Cougar",
  "Falcon",
  "Raven",
  "Sparrow",
  "Robin",
  "Cardinal",
  "Flamingo",
  "Peacock",
  "Swan",
  "Duck",
  "Goose",
  "Pelican",
  "Heron",
  "Butterfly",
  "Bee",
  "Dragonfly",
  "Ladybug",
  "Spider",
  "Ant",
  "Frog",
  "Toad",
  "Lizard",
  "Snake",
  "Gecko",
  "Iguana",
];

export const generateRandomAnimalName = (): string => {
  const randomIndex = Math.floor(Math.random() * ANIMAL_NAMES.length);
  const randomNumber = Math.floor(Math.random() * 999) + 1;
  return `${ANIMAL_NAMES[randomIndex]}${randomNumber}`;
};

export const getStoredPlayerName = (): string => {
  try {
    const storedName = localStorage.getItem("tetris_player_name");
    return storedName && storedName.trim()
      ? storedName.trim()
      : generateRandomAnimalName();
  } catch (error) {
    console.warn("Failed to get stored player name:", error);
    return generateRandomAnimalName();
  }
};

// Chỉ lấy tên đã lưu, không tạo random (dùng cho welcome screen)
export const getStoredPlayerNameOnly = (): string => {
  try {
    const storedName = localStorage.getItem("tetris_player_name");
    return storedName && storedName.trim() ? storedName.trim() : "";
  } catch (error) {
    console.warn("Failed to get stored player name:", error);
    return "";
  }
};

export const storePlayerName = (name: string): void => {
  try {
    localStorage.setItem("tetris_player_name", name.trim());
  } catch (error) {
    console.warn("Failed to store player name:", error);
  }
};
