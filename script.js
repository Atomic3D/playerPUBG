// Функция для загрузки JSON файла
const fetchData = async (url) => {
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Ошибка при загрузке данных:", error);
  }
};
const loader = new THREE.TextureLoader();
// let targetTeamId;
//========================================================
async function getPlayerData(platform, playerId, apiKey) {
  const headers = {
    Authorization: `Bearer ${apiKey}`,
    Accept: "application/vnd.api+json",
  };
  try {
    const response = await fetch(
      `https://api.pubg.com/shards/${platform}/players?filter[playerNames]=${playerId}`,
      {
        method: "GET",
        headers: headers,
      }
    );
    if (!response.ok) {
      throw new Error(`HTTP error status: ${response.status}`);
    }
    const data = await response.json();
    const matchIds = data.data[0].relationships.matches.data.map(
      (match) => match.id
    );

    const matchesInfo = [];
    for (const matchId of matchIds) {
      const response = await fetch(
        `https://api.pubg.com/shards/${platform}/matches/${matchId}`,
        {
          method: "GET",
          headers: headers,
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error status: ${response.status}`);
      }
      const matchData = await response.json();
      const assets = matchData.included
        .filter((item) => item.type === "asset")
        .map((asset) => ({
          url: asset.attributes.URL,
          gameMode: matchData.data.attributes.gameMode,
          matchType: matchData.data.attributes.matchType,
          duration: matchData.data.attributes.duration,
          mapName: matchData.data.attributes.mapName,
        }));

      matchesInfo.push(...assets);
    }
    return matchesInfo;
  } catch (error) {
    console.error("Error fetching player data:", error);
  }
}
//========================================================
const gameModeValue = {
  duo: "Duo TPP",
  "duo-fpp": "Duo FPP",
  solo: "Solo TPP",
  "solo-fpp": "Solo FPP",
  squad: "Squad TPP",
  "squad-fpp": "Squad FPP",
  "conquest-duo": "Conquest Duo TPP",
  "conquest-duo-fpp": "Conquest Duo FPP",
  "conquest-solo": "Conquest Solo TPP",
  "conquest-solo-fpp": "Conquest Solo FPP",
  "conquest-squad": "Conquest Squad TPP",
  "conquest-squad-fpp": "Conquest Squad FPP",
  "esports-duo": "Esports Duo TPP",
  "esports-duo-fpp": "Esports Duo FPP",
  "esports-solo": "Esports Solo TPP",
  "esports-solo-fpp": "Esports Solo FPP",
  "esports-squad": "Esports Squad TPP",
  "esports-squad-fpp": "Esports Squad FPP",
  "normal-duo": "Duo TPP",
  "normal-duo-fpp": "Duo FPP",
  "normal-solo": "Solo TPP",
  "normal-solo-fpp": "Solo FPP",
  "normal-squad": "Squad TPP",
  "normal-squad-fpp": "Squad FPP",
  "war-duo": "War Duo TPP",
  "war-duo-fpp": "War Duo FPP",
  "war-solo": "War Solo TPP",
  "war-solo-fpp": "War Solo FPP",
  "war-squad": "Squad TPP",
  "war-squad-fpp": "War Squad FPP",
  "zombie-duo": "Zombie Duo TPP",
  "zombie-duo-fpp": "Zombie Duo FPP",
  "zombie-solo": "Zombie Solo TPP",
  "zombie-solo-fpp": "Zombie Solo FPP",
  "zombie-squad": "Zombie Squad TPP",
  "zombie-squad-fpp": "Zombie Squad FPP",
  "lab-tpp": "Lab TPP",
  "lab-fpp": "Lab FPP",
  tdm: "Team Deathmatch",
};
const gameMapsName = {
  Baltic_Main: "Erangel",
  Erangel_Main: "Erangel",
  Chimera_Main: "Paramo",
  Desert_Main: "Miramar",
  DihorOtok_Main: "Vikendi",
  Heaven_Main: "Heaven",
  Kiki_Main: "Deston",
  Range_Main: "Camp Jackal",
  Savage_Main: "Sanhok",
  Summerland_Main: "Karakin",
  Tiger_Main: "Taego",
  Neon_Main: "Rondo",
};
//========================================================
async function processJsonFiles(platform, playerId, apiKey) {
  const matchStartArray = [];
  const matchesInfo = await getPlayerData(platform, playerId, apiKey);
  try {
    for (let i = 0; i <= 9; i++) {
      const matchInfo = matchesInfo[i];
      const data = await fetchData(matchInfo.url);
      let mapName = matchInfo.mapName;
      let gameMapName = gameMapsName[mapName];
      let gameMode = matchInfo.gameMode;
      let gameModePlayer = gameModeValue[gameMode];
      // let characters = [];
      // let teamSize;
      // let ranking;
      let characterRanking;
      // let matchCharactersStart = [];
      let matchCharactersEnd = [];
      let logPlayerCreateArray = [];
      let playersInSameTeam;
      // let targetTeamId;

      data.forEach((item) => {
        if (item && item._T === "LogPlayerCreate") {
          const character = item.character;
          logPlayerCreateArray.push({ character });
        }
        // logPlayerCreateArray.forEach((player) => {
        //   if (player.character.name == playerId) {
        //     targetTeamId = player.character.teamId;
        //   }
        // });
        // if (targetTeamId) {
        //   // Фильтруем игроков, принадлежащих той же команде
        //   playersInSameTeam = logPlayerCreateArray.filter(
        //     (player) => player.character.teamId === targetTeamId
        //   );
        // } else {
        //   console.log("Игрок с указанным именем не найден");
        // }

        const targetPlayer = logPlayerCreateArray.find(
          (player) => player.character.name === playerId
        );
        if (!targetPlayer) {
          // console.log("Игрок с указанным именем не найден");
          return;
        }
        const targetTeamId = targetPlayer.character.teamId;
        playersInSameTeam = logPlayerCreateArray.filter(
          (player) => player.character.teamId === targetTeamId
        );

        if (item._T === "LogMatchEnd") {
          matchCharactersEnd = item.characters;
          let foundRanking = false; // Флаг для отслеживания наличия ранга
          matchCharactersEnd.forEach((character) => {
            if (character.character.teamId === targetTeamId) {
              characterRanking = character.character.ranking;
              foundRanking = true; // Установка флага в true при нахождении ранга
            }
          });
          if (foundRanking) {
            const formattedString = `${gameMapName} - ${gameModePlayer} - ${characterRanking}/${matchCharactersEnd.length}`;
            matchStartArray.push(formattedString);
          }
        }
      });
    }
  } catch (error) {
    console.error(`Error processing file at ${url}:`, error);
  }
  return matchStartArray;
}
//========================================================
const platform = document.getElementById("platform").value;
let playerName = document.getElementById("playerName");
const match = document.getElementById("match");
const searchMapsButtonId = document.getElementById("searchMapsButtonId");
const loadMapId = document.getElementById("loadMapId");
let data, dataArray, selectedUrl; // Переменная для хранения загруженных данных JSON
//========================================================
searchMapsButtonId.addEventListener("click", async function () {
  playerName = playerName.value;
  while (match.firstChild) {
    match.removeChild(match.firstChild);
  }
  try {
    let processJsonFilesArray = await processJsonFiles(
      platform,
      playerName,
      apiKey
    );
    let playerData = await getPlayerData(platform, playerName, apiKey);

    processJsonFilesArray.forEach((data) => {
      let option = document.createElement("option");
      option.value = playerData.url;
      option.text = data;
      match.appendChild(option);
    });
  } catch (error) {
    console.error("Произошла ошибка:", error);
  }
});
//========================================================
loadMapId.disabled = true;
//========================================================
match.addEventListener("change", async (event) => {
  const platform = document.getElementById("platform").value;
  const playerName = document.getElementById("playerName").value;

  const playerData = await getPlayerData(platform, playerName, apiKey);
  const selectedIndex = event.target.selectedIndex;
  if (playerData && selectedIndex >= 0 && selectedIndex < playerData.length) {
    selectedUrl = playerData[selectedIndex].url;
    console.log(selectedUrl);
    // console.log(playerData[selectedIndex].gameMode);
    if (selectedUrl) {
      loadMapId.disabled = false;
    }
    return selectedUrl;
  } else {
    console.error("playerData не определено или выбран неверный индекс");
  }
});
//========================================================
loadMapId.addEventListener("click", async function () {
  data = await fetchData(selectedUrl);
  loadMapId.disabled = true;
  const timeSlider = document.getElementById("timeSlider");
  const currentTimeText = document.getElementById("currentTime");
  const playButton = document.getElementById("playButton");
  const stopButton = document.getElementById("stopButton");
  const canvasPlayer = document.getElementById("canvasPlayer");

  timeSlider.value = 0;

  let startTime, endTime;
  let startTimeMatch, endTimeMatch;

  // Размеры канваса
  const canvasWidth = 819;
  const canvasHeight = 819;

  // Divider
  let divider;
  let matchTime = [];
  let minTime, maxTime;

  data.forEach((item) => {
    const date = new Date(item._D);
    if (!startTime || date < startTime) {
      startTime = date.getTime();
    }
    if (!endTime || date > endTime) {
      endTime = date.getTime();
    }
    if (item._T === "LogPlayerPosition") {
      matchTime.push(item.elapsedTime);
    }
  });

  minTime = Math.min(...matchTime);
  maxTime = Math.max(...matchTime);

  const matchDuration = endTime - startTime;

  // Расчет продолжительности матча
  timeSlider.min = startTime; // Преобразование в миллисекунды
  timeSlider.max = endTime;
  timeSlider.step = 1000; // Шаг в миллисекундах
  // timeSlider.min = minTime; // Преобразование в миллисекунды
  // timeSlider.max = maxTime;
  // timeSlider.step = 1; // Шаг в секундах

  let timeDelay = 5000;
  let teams = {};
  let logPlayerCreateArray = [];
  let logPlayerPositionArray = [];
  let gameStateDataArray = [];
  let logMatchStartArray = [];
  let logMatchEndArray = [];
  let logPlayerKillV2Array = [];
  let logVehicleRideArray = [];
  let logVehicleLeaveArray = [];
  let logVehicleLeaveArrayArray = [];
  let logPlayerAttackArray = [];
  let logPlayerTakeDamageArray = [];
  let logPlayerMakeGroggyArray = [];
  let logCarePackageLandArray = [];
  let logCarePackageSpawnArray = [];
  let logItemPickupFromCarepackageArray = [];

  data.forEach((i) => {
    if (i && i._T === "LogPlayerCreate") {
      const eventTime = new Date(i._D);
      const eventTimeGet = eventTime.getTime();
      const character = i.character;
      const common = i.common;

      logPlayerCreateArray.push({
        character,
        common,
        eventTimeGet,
      });
    }
    if (i && i._T === "LogMatchStart") {
      const eventTime = new Date(i._D);
      const eventTimeGet = eventTime.getTime();
      const mapName = i.mapName;
      const weatherId = i.weatherId;
      const characters = i.characters;
      const cameraViewBehaviour = i.cameraViewBehaviour;
      const teamSize = i.teamSize;
      const common = i.common;

      logMatchStartArray.push({
        mapName,
        weatherId,
        characters,
        cameraViewBehaviour,
        teamSize,
        common,
        eventTimeGet,
      });
    }
    if (i && i._T === "LogMatchEnd") {
      const eventTime = new Date(i._D);
      const eventTimeGet = eventTime.getTime();
      const characters = i.characters;
      const gameResultOnFinished = i.gameResultOnFinished;
      const allWeaponStats = i.allWeaponStats;
      const common = i.common;

      logMatchEndArray.push({
        characters,
        gameResultOnFinished,
        allWeaponStats,
        common,
        eventTimeGet,
      });
    }
    if (i && i._T === "LogPlayerPosition") {
      const eventTime = new Date(i._D);
      const eventTimeGet = eventTime.getTime();
      const character = i.character;
      const vehicle = i.vehicle;
      const elapsedTime = i.elapsedTime;
      const numAlivePlayers = i.numAlivePlayers;
      const common = i.common;

      logPlayerPositionArray.push({
        character,
        vehicle,
        elapsedTime,
        numAlivePlayers,
        common,
        eventTimeGet,
      });
    }
    if (i && i._T === "LogGameStatePeriodic") {
      const eventTime = new Date(i._D);
      const eventTimeGet = eventTime.getTime();
      const elapsedTime = i.gameState.elapsedTime;
      const numStartTeams = i.gameState.numStartTeams;
      const numAliveTeams = i.gameState.numAliveTeams;
      const numParticipatedTeams = i.gameState.numParticipatedTeams;
      const numJoinPlayers = i.gameState.numJoinPlayers;
      const numStartPlayers = i.gameState.numStartPlayers;
      const numAlivePlayers = i.gameState.numAlivePlayers;
      const numParticipatedPlayers = i.gameState.numParticipatedPlayers;
      const poisonGasWarningPosition = i.gameState.poisonGasWarningPosition;
      const poisonGasWarningRadius = i.gameState.poisonGasWarningRadius;
      const safetyZonePosition = i.gameState.safetyZonePosition;
      const safetyZoneRadius = i.gameState.safetyZoneRadius;
      const redZonePosition = i.gameState.redZonePosition;
      const redZoneRadius = i.gameState.redZoneRadius;
      const blackZonePosition = i.gameState.blackZonePosition;
      const blackZoneRadius = i.gameState.blackZoneRadius;
      const common = i.common;

      gameStateDataArray.push({
        elapsedTime,
        numStartTeams,
        numAliveTeams,
        numParticipatedTeams,
        numJoinPlayers,
        numStartPlayers,
        numAlivePlayers,
        numParticipatedPlayers,
        poisonGasWarningPosition,
        poisonGasWarningRadius,
        safetyZonePosition,
        safetyZoneRadius,
        redZonePosition,
        redZoneRadius,
        blackZonePosition,
        blackZoneRadius,
        common,
        eventTimeGet,
      });
    }
    if (i && i._T === "LogPlayerKillV2") {
      const eventTime = new Date(i._D);
      const eventTimeGet = eventTime.getTime();
      const attackId = i.attackId;
      const dBNOId = i.dBNOId;
      const victimGameResult = i.victimGameResult;
      const victim = i.victim;
      const dBNOMaker = i.dBNOMaker;
      const dBNODamageInfo = i.dBNODamageInfo;
      const finisher = i.finisher;
      const finishDamageInfo = i.finishDamageInfo;
      const killer = i.killer;
      const killerDamageInfo = i.killerDamageInfo;
      const common = i.common;

      logPlayerKillV2Array.push({
        attackId,
        dBNOId,
        victimGameResult,
        victim,
        dBNOMaker,
        dBNODamageInfo,
        finisher,
        finishDamageInfo,
        killer,
        killerDamageInfo,
        common,
        eventTimeGet,
      });
    }
    if (i && i._T === "LogVehicleRide") {
      const eventTime = new Date(i._D);
      const eventTimeGet = eventTime.getTime();
      const character = i.character;
      const vehicle = i.vehicle;
      const common = i.common;

      logVehicleRideArray.push({
        character,
        vehicle,
        common,
        eventTimeGet,
      });
    }
    if (i && i._T === "LogVehicleLeave") {
      const eventTime = new Date(i._D);
      const eventTimeGet = eventTime.getTime();
      const character = i.character;
      const vehicle = i.vehicle;
      const common = i.common;

      logVehicleLeaveArray.push({
        character,
        vehicle,
        common,
        eventTimeGet,
      });
    }
    if (i && i._T === "LogPlayerAttack") {
      const eventTime = new Date(i._D);
      const eventTimeGet = eventTime.getTime();
      const attackId = i.attackId;
      const fireWeaponStackCount = i.fireWeaponStackCount;
      const attacker = i.attacker;
      const attackType = i.attackType;
      const weapon = i.weapon;
      const vehicle = i.vehicle;
      const common = i.common;

      logPlayerAttackArray.push({
        attackId,
        fireWeaponStackCount,
        attacker,
        attackType,
        weapon,
        vehicle,
        common,
        eventTimeGet,
      });
    }
    if (
      i &&
      i._T === "LogPlayerTakeDamage" &&
      !(i.attacker === null) &&
      !(i.damageTypeCategory === "Damage_BlueZone")
    ) {
      const eventTime = new Date(i._D);
      const eventTimeGet = eventTime.getTime();
      const attackId = i.attackId;
      const attacker = i.attacker;
      const victim = i.victim;
      const damageTypeCategory = i.damageTypeCategory;
      const damageReason = i.damageReason;
      const damage = i.damage;
      const damageCauserName = i.damageCauserName;
      const common = i.common;

      logPlayerTakeDamageArray.push({
        attackId,
        attacker,
        victim,
        damageTypeCategory,
        damageReason,
        damage,
        damageCauserName,
        common,
        eventTimeGet,
      });
    }
    if (i && i._T === "LogPlayerMakeGroggy") {
      const eventTime = new Date(i._D);
      const eventTimeGet = eventTime.getTime();
      const attackId = i.attackId;
      const attacker = i.attacker;
      const victim = i.victim;
      const damageReason = i.damageReason;
      const damageTypeCategory = i.damageTypeCategory;
      const damageCauserName = i.damageCauserName;
      const damageCauserAdditionalInfo = i.damageCauserAdditionalInfo;
      const victimWeapon = i.victimWeapon;
      const victimWeaponAdditionalInfo = i.victimWeaponAdditionalInfo;
      const distance = i.distance;
      const isAttackerInVehicle = i.isAttackerInVehicle;
      const dBNOId = i.dBNOId;
      const common = i.common;

      logPlayerMakeGroggyArray.push({
        attackId,
        attacker,
        victim,
        damageReason,
        damageTypeCategory,
        damageCauserName,
        damageCauserAdditionalInfo,
        victimWeapon,
        victimWeaponAdditionalInfo,
        distance,
        isAttackerInVehicle,
        dBNOId,
        common,
        eventTimeGet,
      });
    }
    if (i && i._T === "LogCarePackageLand") {
      const eventTime = new Date(i._D);
      const eventTimeGet = eventTime.getTime();
      const itemPackage = i.itemPackage;
      const common = i.common;

      logCarePackageLandArray.push({
        itemPackage,
        common,
        eventTimeGet,
      });
    }
    if (i && i._T === "LogCarePackageSpawn") {
      const eventTime = new Date(i._D);
      const eventTimeGet = eventTime.getTime();
      const itemPackage = i.itemPackage;
      const common = i.common;

      logCarePackageSpawnArray.push({
        itemPackage,
        common,
        eventTimeGet,
      });
    }
    if (i && i._T === "LogItemPickupFromCarepackage") {
      const eventTime = new Date(i._D);
      const eventTimeGet = eventTime.getTime();
      const character = i.character;
      const item = i.item;
      const carePackageUniqueId = i.carePackageUniqueId;
      const carePackageName = i.carePackageName;
      const common = i.common;

      logItemPickupFromCarepackageArray.push({
        character,
        item,
        carePackageUniqueId,
        carePackageName,
        common,
        eventTimeGet,
      });
    }
  });
  //========================================================
  logPlayerCreateArray.forEach((player) => {
    // Получение teamId текущего персонажа
    let teamId = player.character.teamId;
    // Проверяем, существует ли уже команда с таким teamId
    if (!teams[teamId]) {
      // Если нет, создаем новую команду
      teams[teamId] = [];
    }
    // Добавляем персонажа в список команды
    teams[teamId].push(player.character);
  });
  //========================================================
  let targetTeamId;
  let playersInSameTeam;
  logPlayerCreateArray.forEach((player) => {
    if (player.character.name == playerName) {
      targetTeamId = player.character.teamId;
    }
  });
  if (targetTeamId) {
    // Фильтруем игроков, принадлежащих той же команде
    playersInSameTeam = logPlayerCreateArray.filter(
      (player) => player.character.teamId === targetTeamId
    );
  } else {
    console.log("Игрок с указанным именем не найден");
  }
  //========================================================
  logVehicleLeaveArray.forEach((player) => {
    if (
      player.vehicle.vehicleType === "TransportAircraft" &&
      player.common.isGame <= 0.5
    ) {
      logVehicleLeaveArrayArray.push(player);
    }
  });
  //========================================================
  let matchStartMapName = logMatchStartArray[0].mapName;
  let mapTexture;
  let mapName;
  switch (matchStartMapName) {
    case "Baltic_Main":
    case "Erangel_Main":
      mapName = "Erangel";
      mapTexture = loader.load("public/map/map_Baltic_Main.png");
      // mapTexture = loader.load(
      //   "https://github.com/pubg/api-assets/blob/master/Assets/Maps/Erangel_Main_Low_Res.png"
      // );
      divider = 1000;
      break;
    case "Chimera_Main":
      mapName = "Paramo";
      mapTexture = loader.load("public/map/map_Chimera_Main.png");
      // mapTexture = loader.load(
      //   "https://github.com/pubg/api-assets/blob/master/Assets/Maps/Paramo_Main_Low_Res.png"
      // );
      divider = 375;
      break;
    case "Desert_Main":
      mapName = "Miramar";
      mapTexture = loader.load("public/map/map_Desert_Main.png");
      // mapTexture = loader.load(
      //   "https://github.com/pubg/api-assets/blob/master/Assets/Maps/Miramar_Main_Low_Res.png"
      // );
      divider = 1000;
      break;
    case "DihorOtok_Main":
      mapName = "Vikendi";
      mapTexture = loader.load("public/map/map_DihorOtok_Main.png");
      // mapTexture = loader.load(
      //   "https://github.com/pubg/api-assets/blob/master/Assets/Maps/Vikendi_Main_Low_Res.png"
      // );
      divider = 1000;
      break;
    case "Heaven_Main":
      mapName = "Heaven";
      mapTexture = loader.load("public/map/map_Heaven_Main.png");
      // mapTexture = loader.load(
      //   "https://github.com/pubg/api-assets/blob/master/Assets/Maps/Haven_Main_Low_Res.png"
      // );
      divider = 125;
      break;
    case "Kiki_Main":
      mapName = "Deston";
      mapTexture = loader.load("public/map/map_Kiki_Main.png");
      // mapTexture = loader.load(
      //   "https://github.com/pubg/api-assets/blob/master/Assets/Maps/Deston_Main_Low_Res.png"
      // );
      divider = 1000;
      break;
    case "Range_Main":
      mapName = "Camp Jackal";
      mapTexture = loader.load("public/map/map_Range_Main.png");
      // mapTexture = loader.load(
      //   "https://github.com/pubg/api-assets/blob/master/Assets/Maps/Camp_Jackal_Main_Low_Res.png"
      // );
      divider = 250;
      break;
    case "Savage_Main":
      mapName = "Sanhok";
      mapTexture = loader.load("public/map/map_Savage_Main.png");
      // mapTexture = loader.load(
      //   "https://github.com/pubg/api-assets/blob/master/Assets/Maps/Sanhok_Main_Low_Res.png"
      // );
      divider = 500;
      break;
    case "Summerland_Main":
      mapName = "Karakin";
      mapTexture = loader.load("public/map/map_Summerland_Main.png");
      // mapTexture = loader.load(
      //   "https://github.com/pubg/api-assets/blob/master/Assets/Maps/Karakin_Main_Low_Res.png"
      // );
      divider = 250;
      break;
    case "Tiger_Main":
      mapName = "Taego";
      mapTexture = loader.load("public/map/map_Tiger_Main.png");
      // mapTexture = loader.load(
      //   "https://github.com/pubg/api-assets/blob/master/Assets/Maps/Taego_Main_Low_Res.png"
      // );
      divider = 1000;
      break;
    case "Neon_Main":
      mapName = "Rondo";
      mapTexture = loader.load("public/map/map_Neon_Main.png");
      // mapTexture = loader.load(
      //   "https://github.com/pubg/api-assets/blob/master/Assets/Maps/Rondo_Main_Low_Res.png"
      // );
      divider = 1000;
      break;
    default:
      mapName = "Default";
      divider = 1000;
      break;
  }
  //========================================================
  function randomColors() {
    const colors = [];
    for (let i = 0; i <= 99; i++) {
      colors.push(generateRandomColor());
    }
    return colors;
  }
  function generateRandomColor() {
    const red = Math.floor(Math.random() * 256).toString(16);
    const green = Math.floor(Math.random() * 256).toString(16);
    const blue = Math.floor(Math.random() * 256).toString(16);
    // Добавляем ведущие нули, если они отсутствуют
    const paddedRed = red.padStart(2, "0");
    const paddedGreen = green.padStart(2, "0");
    const paddedBlue = blue.padStart(2, "0");

    return "#" + paddedRed + paddedGreen + paddedBlue;
  }
  //========================================================
  let currentColorIndex = 0; // Индекс для следования по массиву COLORS
  const COLORS = randomColors();

  // Проходим по каждому teamId в teams
  Object.keys(teams).forEach((teamId) => {
    teams[teamId].color = COLORS[currentColorIndex];
    currentColorIndex++;
    if (currentColorIndex >= COLORS.length) {
      currentColorIndex = 0;
    }
  });

  // Инициализация Three.js
  const scene = new THREE.Scene();
  const renderer = new THREE.WebGLRenderer({
    alpha: true,
  });
  renderer.setSize(canvasWidth, canvasHeight);
  canvasPlayer.appendChild(renderer.domElement);

  const domElements = Array.from(canvasPlayer.children);
  const targetDomElement = domElements.find(
    (element) => element.tagName === "CANVAS"
  );
  if (targetDomElement) {
    targetDomElement.id = "playerCanvas";
  }

  //========================================================
  const camera = new THREE.OrthographicCamera(
    canvasWidth / -2,
    canvasWidth / 2,
    canvasHeight / 2,
    canvasHeight / -2,
    -1000,
    2000
  );
  camera.position.set(0, 0, -1);
  camera.lookAt(0, 0, 1);
  camera.rotateZ(Math.PI);
  //========================================================
  const wheelTexture = loader.load("public/picture/wheel.png");
  // Создаем геометрию и материал для плоскости
  let planeGeometry = new THREE.PlaneGeometry(canvasWidth, canvasHeight);
  let planeMaterial = new THREE.MeshBasicMaterial({
    map: mapTexture,
    side: THREE.DoubleSide,
  });
  let plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.lookAt(0, 0, -1);
  plane.rotateZ(Math.PI);
  scene.add(plane);
  //========================================================
  // Функция для изменения уровня "zoom"
  let currentScale = 1; // Начальный масштаб
  //=========================================
  // canvasPlayer[0].addEventListener("mousemove", (e) => {
  //   const rect = canvasPlayer[0].getBoundingClientRect();
  //   console.log(
  //     `Позиция курсора: x=${e.clientX - rect.left}, y=${e.clientY - rect.top}`
  //   );
  // });
  //=========================================
  // canvasPlayer[0].addEventListener('mousemove', (e) => {
  //   const rect = canvasPlayer[0].getBoundingClientRect();
  //   const computedStyle = getComputedStyle(canvasPlayer[0]);
  //   const borderLeftWidth = parseInt(computedStyle.borderLeftWidth, 10);
  //   const borderTopWidth = parseInt(computedStyle.borderTopWidth, 10);
  //   // Учтём размеры границ элемента.
  //   console.log(`Позиция курсора: x=${e.clientX - rect.left - borderLeftWidth}, y=${e.clientY - rect.top - borderTopWidth}`);
  // });
  //=========================================
  function drawFlyingLine() {
    const childName = "flyingLine";
    const material = new THREE.LineBasicMaterial({
      color: 0xffffff,
    });
    let pointFirst, pointSecond;
    let pointFirstEquation, pointSecondEquation;
    let endX, endY;
    let x1, x2, y1, y2;
    for (let i = 0; i <= logVehicleLeaveArrayArray.length; i++) {
      pointFirst = new THREE.Vector3(
        logVehicleLeaveArrayArray[0].character.location.x,
        logVehicleLeaveArrayArray[0].character.location.y,
        logVehicleLeaveArrayArray[0].character.location.z
      );
      pointSecond = new THREE.Vector3(
        logVehicleLeaveArrayArray[
          logVehicleLeaveArrayArray.length - 1
        ].character.location.x,
        logVehicleLeaveArrayArray[
          logVehicleLeaveArrayArray.length - 1
        ].character.location.y,
        logVehicleLeaveArrayArray[
          logVehicleLeaveArrayArray.length - 1
        ].character.location.z
      );
    }
    x1 = pointFirst.x;
    y1 = pointFirst.y;
    x2 = pointSecond.x;
    y2 = pointSecond.y;

    const k = (y2 - y1) / (x2 - x1);
    const b = y2 - k * x2;
    if (x1 < x2) {
      // Полет c лева
      endX = canvasWidth * divider;
      endY = k * endX + b;
    }
    if (x1 > x2) {
      // Полет с права
      endX = 0;
      endY = k * endX + b;
    }
    pointFirstEquation = { x: x1, y: y1, z: 0 };
    pointSecondEquation = { x: endX, y: endY, z: 0 };
    const points = [pointFirstEquation, pointSecondEquation];
    // const points = [pointFirst, pointSecond];
    // console.log(points);

    const scaledPoints = points.map((point) => ({
      x: point.x / divider,
      y: point.y / divider,
      z: 0,
    }));
    const minusPoints = scaledPoints.map((point) => ({
      x: point.x - canvasWidth / 2,
      y: point.y - canvasHeight / 2,
      z: 0,
    }));

    const geometry = new THREE.BufferGeometry().setFromPoints(minusPoints);
    const line = new THREE.Line(geometry, material);
    line.name = childName;
    scene.add(line);
    renderer.render(scene, camera);
  }
  //========================================================
  function changeZoom(delta, mouseX, mouseY) {
    currentScale *= delta;

    const maxScale = 1;
    const minScale = 0.25;
    // Ограничение масштаба
    if (currentScale > maxScale) currentScale = maxScale;
    if (currentScale < minScale) currentScale = minScale;

    // Вычисляем новые параметры для ортографической камеры
    const aspectRatio = canvasWidth / canvasHeight;
    const halfWidth = (Math.abs(currentScale) * canvasWidth) / 2;
    const halfHeight = (Math.abs(currentScale) * canvasHeight) / 2;

    camera.left = 0;
    camera.right = 2 * halfWidth * aspectRatio;
    camera.top = 2 * halfHeight;
    camera.bottom = 0;
    // camera.left = -halfWidth * aspectRatio;
    // camera.right = halfWidth * aspectRatio;
    // camera.top = halfHeight;
    // camera.bottom = -halfHeight;

    camera.updateProjectionMatrix();

    // Обновляем позицию камеры, чтобы сфокусироваться на курсоре
    camera.position.set(mouseX, mouseY, 0);

    // Рендеринг сцены
    renderScene();
  }

  // canvasPlayer1.addEventListener("wheel", onWheelZoom);
  // canvasPlayer[0].addEventListener("wheel", onWheelZoom, {
  //   passive: false,
  // });

  // function onWheelZoom(event) {
  //   event.preventDefault(); // Предотвращаем стандартное поведение прокрутки страницы
  //   let delta = event.deltaY < 0 ? 1.1 : 1 / 1.1; // Увеличиваем "zoom" при прокрутке вниз, уменьшаем при прокрутке вверх
  //   changeZoom(delta);
  // }

  function renderScene() {
    renderer.render(scene, camera);
  }
  //========================================================
  // Обработчик событияMouseMove для изменения масштаба под курсором мыши
  let lastMouseX = null;
  let lastMouseY = null;

  function onWheel(event) {
    event.preventDefault(); // Предотвращаем стандартное поведение прокрутки страницы

    const rect = canvasPlayer.getBoundingClientRect();
    const mouseX = event.clientX - rect.left; // Получаем X координату курсора относительно canvasPlayer
    const mouseY = event.clientY - rect.top; // Получаем Y координату курсора относительно canvasPlayer
    console.log(mouseX, mouseY);
    // Вычисляем новый масштаб в зависимости от положения курсора
    let delta = event.deltaY < 0 ? 1.1 : 1 / 1.1; // Увеличиваем "zoom" при прокрутке вниз, уменьшаем при прокрутке вверх
    // console.log(delta);
    changeZoom(delta, mouseX, mouseY);

    // Обновляем последние координаты мыши
    lastMouseX = mouseX;
    lastMouseY = mouseY;
  }

  // Добавляем обработчик события
  // canvasPlayer[0].addEventListener("wheel", onWheel, { passive: false });
  // =======================================================
  function generateSequence(start, end, step) {
    let sequence = [];
    for (let i = start; i <= end; i += step) {
      sequence.push(i);
    }
    return sequence;
  }
  //========================================================
  let numbers = generateSequence(startTime, endTime, timeDelay / 5);
  //========================================================
  timeSlider.addEventListener("input", function () {
    const time = this.valueAsNumber;
    // console.log("-----");
    console.log(time);
    const timeInSeconds = time / 1000 - startTime / 1000;

    drawFlyingLine();
    drawPlayersPositions(time);
    drawZones(time);
    playerTakeDamage(time);
    playerDeath(time);
    carePackage(time);

    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    currentTimeText.textContent = `${hours
      .toString()
      .padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  });
  //========================================================
  let index = 0; // Индекс для перебора массива numbers
  let shouldContinue = true; // Флаг для контроля выполнения

  function nextTime() {
    if (shouldContinue && index < numbers.length) {
      const time = numbers[index];
      drawPlayersPositions(time);
      drawZones(time);
      playerTakeDamage(time);
      playerDeath(time);
      carePackage(time);

      const timeInSeconds = time / 1000 - startTime / 1000;
      const hours = Math.floor(timeInSeconds / 3600);
      const minutes = Math.floor((timeInSeconds % 3600) / 60);
      const seconds = Math.floor(timeInSeconds % 60);
      currentTimeText.textContent = `${hours
        .toString()
        .padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`;

      setTimeout(nextTime, 250); // Запускаем следующую итерацию
      index++;
    }
  }
  //========================================================
  playButton.addEventListener("click", function () {
    shouldContinue = true;
    nextTime();
  });
  stopButton.addEventListener("click", function () {
    shouldContinue = false;
  });
  //========================================================
  function playerTakeDamage(time) {
    const childName = "shootLine";
    // Получаем все дочерние объекты сцены
    const allChildren = scene.children;
    // Проходим по всем дочерним объектам
    for (let i = allChildren.length - 1; i >= 0; i--) {
      const child = allChildren[i];
      // Проверяем, имеет ли дочерний объект имя
      if (child.name === childName) {
        // Удаляем дочерний объект из сцены
        scene.remove(child);
      }
    }
    const filteredEventsPlayerTakeDamage = logPlayerTakeDamageArray.filter(
      (event) => Math.abs(event.eventTimeGet - time) <= timeDelay
    );
    filteredEventsPlayerTakeDamage.forEach((event) => {
      const material = new THREE.LineBasicMaterial({
        color: 0xffffff,
      });
      const pointsKiller = new THREE.Vector3(
        event.attacker.location.x,
        event.attacker.location.y,
        event.attacker.location.z
      );
      const pointsVictim = new THREE.Vector3(
        event.victim.location.x,
        event.victim.location.y,
        event.victim.location.z
      );
      // const points = [pointsKiller, pointsVictim];
      const points = [];
      points.push(pointsKiller);
      points.push(pointsVictim);

      const scaledPoints = points.map((point) => ({
        x: point.x / divider,
        y: point.y / divider,
        z: point.z / divider,
      }));
      const minusPoints = scaledPoints.map((point) => ({
        x: point.x - canvasWidth / 2,
        y: point.y - canvasHeight / 2,
        z: 0,
      }));

      const geometry = new THREE.BufferGeometry().setFromPoints(minusPoints);
      const line = new THREE.Line(geometry, material);
      line.name = childName;
      scene.add(line);
    });
    renderer.render(scene, camera);
  }
  //========================================================
  function playerDeath(time) {
    const childName1 = "playerDeath_1";
    const childName2 = "playerDeath_2";

    const filteredEvents = logPlayerKillV2Array.filter(
      (event) => Math.abs(event.eventTimeGet - time) <= timeDelay
    );
    filteredEvents.forEach((event) => {
      const victim = event.victim;
      if (victim) {
        const teamId = victim.teamId;
        const startX = event.victim.location.x / divider;
        const startY = event.victim.location.y / divider;

        const x = 0,
          y = 0; // Начальная точка
        const crossShape = new THREE.Shape();
        const crossWidth = 5,
          crossHeight = 5;
        crossShape.moveTo(x, y - crossHeight / 2);
        crossShape.lineTo(x + crossWidth / 2, y - crossHeight);
        crossShape.lineTo(x + crossWidth, y - crossHeight / 2);
        crossShape.lineTo(x + crossWidth / 2, y);
        crossShape.lineTo(x + crossWidth, y + crossHeight / 2);
        crossShape.lineTo(x + crossWidth / 2, y + crossHeight);
        crossShape.lineTo(x, y + crossHeight / 2);
        crossShape.lineTo(x - crossWidth / 2, y + crossHeight);
        crossShape.lineTo(x - crossWidth, y - crossHeight / 2);
        crossShape.lineTo(x - crossWidth / 2, y);
        crossShape.lineTo(x - crossWidth, y - crossHeight / 2);
        crossShape.lineTo(x - crossWidth / 2, y - crossHeight);
        crossShape.lineTo(x, y - crossHeight / 2);
        crossShape.closePath(); // Закрытие формы
        const crossGeometry = new THREE.ShapeGeometry(crossShape);
        const crossMaterial = new THREE.MeshBasicMaterial({
          color: teams[teamId].color,
          side: THREE.DoubleSide,
        });
        const crossMesh = new THREE.Mesh(crossGeometry, crossMaterial);

        const outlineMaterial = new THREE.LineBasicMaterial({
          color: "black",
          linewidth: 2,
          side: THREE.DoubleSide,
        });
        const outlineGeometry = new THREE.EdgesGeometry(crossGeometry);
        const outlineMesh = new THREE.LineSegments(
          outlineGeometry,
          outlineMaterial
        );

        const cross = new THREE.Group();
        cross.add(outlineMesh);
        cross.add(crossMesh);
        cross.name = childName1;
        cross.lookAt(0, 0, -1);
        cross.rotateZ(Math.PI);
        scene.add(cross);
        cross.position.set(startX - canvasWidth / 2, startY - canvasHeight / 2);
      }
    });
    renderer.render(scene, camera);
  }
  //========================================================
  function carePackage(time) {
    const childName1 = "carePackage_1";
    const childName2 = "carePackage_2";

    const filteredEvents = logCarePackageLandArray.filter(
      (event) => Math.abs(event.eventTimeGet - time) <= timeDelay
    );
    filteredEvents.forEach((event) => {
      const itemPackage = event.itemPackage;
      if (itemPackage) {
        const startX = event.itemPackage.location.x / divider;
        const startY = event.itemPackage.location.y / divider;

        const x = 0,
          y = 0; // Начальная точка
        const carePackageShape1 = new THREE.Shape();
        carePackageShape1.moveTo(x + 0, y + 0);
        carePackageShape1.lineTo(x + 5, y + 0);
        carePackageShape1.lineTo(x + 5, y - 4);
        carePackageShape1.lineTo(x - 5, y - 4);
        carePackageShape1.lineTo(x - 5, y + 0);
        carePackageShape1.lineTo(x + 0, y + 0);
        carePackageShape1.closePath(); // Закрытие формы
        const carePackageGeometry1 = new THREE.ShapeGeometry(carePackageShape1);
        const carePackageMaterial1 = new THREE.MeshBasicMaterial({
          color: "red",
          side: THREE.DoubleSide,
        });
        const carePackageMesh1 = new THREE.Mesh(
          carePackageGeometry1,
          carePackageMaterial1
        );
        const outlineMaterial1 = new THREE.LineBasicMaterial({
          color: "black",
          linewidth: 1,
          side: THREE.DoubleSide,
        });
        const outlineGeometry1 = new THREE.EdgesGeometry(carePackageGeometry1);
        const outlineMesh1 = new THREE.LineSegments(
          outlineGeometry1,
          outlineMaterial1
        );

        const carePackageShape2 = new THREE.Shape();
        carePackageShape2.moveTo(x + 0, y + 1);
        carePackageShape2.lineTo(x + 5, y + 1);
        carePackageShape2.lineTo(x + 5, y + 3);
        carePackageShape2.lineTo(x - 5, y + 3);
        carePackageShape2.lineTo(x - 5, y + 1);
        carePackageShape2.lineTo(x - 0, y + 1);
        carePackageShape2.closePath(); // Закрытие формы
        const carePackageGeometry2 = new THREE.ShapeGeometry(carePackageShape2);
        const carePackageMaterial2 = new THREE.MeshBasicMaterial({
          color: "blue",
          side: THREE.DoubleSide,
        });
        const carePackageMesh2 = new THREE.Mesh(
          carePackageGeometry2,
          carePackageMaterial2
        );
        const outlineMaterial2 = new THREE.LineBasicMaterial({
          color: "black",
          linewidth: 1,
          side: THREE.DoubleSide,
        });
        const outlineGeometry2 = new THREE.EdgesGeometry(carePackageGeometry2);
        const outlineMesh2 = new THREE.LineSegments(
          outlineGeometry2,
          outlineMaterial2
        );

        const carePackage = new THREE.Group();
        carePackage.add(carePackageMesh1);
        carePackage.add(outlineMesh1);
        carePackage.add(carePackageMesh2);
        carePackage.add(outlineMesh2);
        carePackage.name = childName1;
        carePackage.lookAt(0, 0, -1);
        carePackage.rotateZ(Math.PI);
        scene.add(carePackage);
        carePackage.position.set(
          startX - canvasWidth / 2,
          startY - canvasHeight / 2
        );
      }
    });
    renderer.render(scene, camera);
  }
  //========================================================
  let logVehicle = false;

  function isCharacterInVehicle(name, time) {
    const rideInEvent = logVehicleRideArray.find(
      (event) =>
        event.character.name === name &&
        Math.abs(event.eventTimeGet - time) <= timeDelay
    );
    const rideOutEvent = logVehicleLeaveArray.find(
      (event) =>
        event.character.name === name &&
        Math.abs(event.eventTimeGet - time) <= timeDelay
    );
    if (rideInEvent) {
      logVehicle = true;
      // return logVehicle;
      return true;
    }
    if (rideOutEvent) {
      logVehicle = false;
      // return logVehicle;
      return false;
    }
    // return logVehicle;
  }
  //========================================================
  function drawPlayersPositions(time) {
    // Получаем все дочерние объекты сцены
    const allChildren = scene.children;
    const childName1 = "circle_1";
    const childName2 = "circle_2";
    const childName3 = "circle_3";
    const childName4 = "circle_4";
    // Проходим по всем дочерним объектам
    for (let i = allChildren.length - 1; i >= 0; i--) {
      const child = allChildren[i];
      // Проверяем, имеет ли дочерний объект имя "circle_1"
      if (
        child.name == childName1 ||
        child.name == childName2 ||
        child.name == childName3 ||
        child.name == childName4
      ) {
        // Удаляем дочерний объект из сцены
        scene.remove(child);
      }
    }

    // const filteredPlayers = logPlayerPositionArray.filter(
    //   (player) => player.character.name && player.elapsedTime == time
    // );
    const filteredPlayers = logPlayerPositionArray.filter(
      (player) =>
        player.character.teamId != targetTeamId &&
        Math.abs(player.eventTimeGet - time) <= timeDelay
    );

    filteredPlayers.forEach((player) => {
      const teamId = player.character.teamId;
      const playerIsInVehicle = player.vehicle;

      if (playerIsInVehicle != null) {
        // Если персонаж внутри транспортного средства, используем текстуру
        const material1 = new THREE.MeshBasicMaterial({
          color: teams[teamId].color,
          side: THREE.DoubleSide,
        });
        const geometry1 = new THREE.CircleGeometry(4, 32);
        const mesh1 = new THREE.Mesh(geometry1, material1);

        const material2 = new THREE.MeshBasicMaterial({
          color: "black",
          side: THREE.DoubleSide,
        });
        const geometry2 = new THREE.RingGeometry(4, 5, 32);
        const mesh2 = new THREE.Mesh(geometry2, material2);

        const x = 0;
        const y = 0;
        const radius = 1.5;
        let startAngle = 0;
        let endAngle = 180;
        const longX = 3.5;
        const longY = 0.5;
        const clockwise = false;
        startAngle = startAngle * (Math.PI / 180);
        endAngle = endAngle * (Math.PI / 180);

        const wheelPath1 = new THREE.Shape();
        wheelPath1.moveTo(x - longX, y + longY);
        wheelPath1.lineTo(x + longX, y + longY);
        wheelPath1.lineTo(x + longX, y - longY);
        wheelPath1.lineTo(x - longX, y - longY);
        wheelPath1.lineTo(x - longX, y + longY);
        wheelPath1.moveTo(x, y);
        wheelPath1.lineTo(x + longY, y);
        wheelPath1.lineTo(x + longY, y - longX);
        wheelPath1.lineTo(x - longY, y - longX);
        wheelPath1.lineTo(x - longY, y);
        wheelPath1.lineTo(x, y);
        wheelPath1.moveTo(x, y);
        wheelPath1.closePath();
        const wheelGeometry1 = new THREE.ShapeGeometry(wheelPath1);
        const wheelMaterial = new THREE.MeshBasicMaterial({
          color: "black",
          side: THREE.DoubleSide,
        });
        const wheel1 = new THREE.Mesh(wheelGeometry1, wheelMaterial);

        const wheelPath2 = new THREE.Shape();
        wheelPath2.moveTo(x, y);
        wheelPath2.absarc(x, y, radius, startAngle, endAngle, clockwise);
        wheelPath2.absarc(x, y, radius, endAngle, startAngle, clockwise);
        wheelPath2.closePath();
        const wheelGeometry2 = new THREE.ShapeGeometry(wheelPath2);

        const wheel2 = new THREE.Mesh(wheelGeometry2, wheelMaterial);
        const wheel = new THREE.Group();
        wheel.add(wheel1);
        wheel.add(wheel2);

        scene.add(wheel);
        wheel.position.set(0, 0, 0);

        const circle = new THREE.Group();
        circle.add(mesh1);
        circle.add(mesh2);
        circle.add(wheel);
        circle.name = childName1;
        circle.lookAt(0, 0, -1);
        circle.rotateZ(Math.PI);
        scene.add(circle);
        // Обновляем позицию круга
        circle.position.set(
          player.character.location.x / divider - canvasWidth / 2,
          player.character.location.y / divider - canvasHeight / 2,
          0
        );
      } else {
        // Если персонаж вне транспортного средства, используем другой материал
        const material1 = new THREE.MeshBasicMaterial({
          color: teams[teamId].color,
          side: THREE.DoubleSide,
        });
        const geometry1 = new THREE.CircleGeometry(4, 32);
        const mesh1 = new THREE.Mesh(geometry1, material1);

        const material2 = new THREE.MeshBasicMaterial({
          color: "black",
          side: THREE.DoubleSide,
        });
        const geometry2 = new THREE.RingGeometry(4, 5, 32);
        const mesh2 = new THREE.Mesh(geometry2, material2);

        const circle = new THREE.Group();
        circle.add(mesh1);
        circle.add(mesh2);
        circle.name = childName1;
        scene.add(circle);
        // Обновляем позицию круга
        circle.position.set(
          player.character.location.x / divider - canvasWidth / 2,
          player.character.location.y / divider - canvasHeight / 2,
          0
        );
      }
    });

    const filteredPlayerName = logPlayerPositionArray.filter(
      (player) =>
        player.character.teamId == targetTeamId &&
        Math.abs(player.eventTimeGet - time) <= timeDelay
    );

    filteredPlayerName.forEach((player) => {
      const teamId = player.character.teamId;
      const playerIsInVehicle = player.vehicle;

      if (playerIsInVehicle != null) {
        const starShape = new THREE.Shape();
        const outerRadius = 5;
        const innerRadius = 2;
        const numPoints = 5;
        let startAngle = 90;

        const initialAngleOffset = startAngle * (Math.PI / 180);

        for (let i = 0; i < numPoints * 2; i++) {
          const angle = (i / numPoints) * Math.PI + initialAngleOffset; // Добавляем смещение угла;
          const radius = i % 2 === 0 ? outerRadius : innerRadius;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          if (i === 0) {
            starShape.moveTo(x, y);
          } else {
            starShape.lineTo(x, y);
          }
        }
        starShape.closePath();

        const starGeometry = new THREE.ShapeGeometry(starShape);
        const starMaterial = new THREE.MeshBasicMaterial({
          color: teams[teamId].color,
          side: THREE.DoubleSide,
        });
        const starMesh = new THREE.Mesh(starGeometry, starMaterial);
        const outlineMaterial = new THREE.LineBasicMaterial({
          color: "black",
          linewidth: 2,
          side: THREE.DoubleSide,
        });
        const outlineGeometry = new THREE.EdgesGeometry(starGeometry);
        const outlineMesh = new THREE.LineSegments(
          outlineGeometry,
          outlineMaterial
        );

        const star = new THREE.Group();
        star.add(outlineMesh);
        star.add(starMesh);
        star.name = childName1;
        star.scale.set(1.2, 1.2, 0);
        scene.add(star);

        const x = 0;
        const y = 0;
        const radius = 1.5;
        startAngle = 0;
        let endAngle = 180;
        const longX = 3.5;
        const longY = 0.5;
        const clockwise = false;
        startAngle = startAngle * (Math.PI / 180);
        endAngle = endAngle * (Math.PI / 180);

        const wheelPath1 = new THREE.Shape();
        wheelPath1.moveTo(x - longX, y + longY);
        wheelPath1.lineTo(x + longX, y + longY);
        wheelPath1.lineTo(x + longX, y - longY);
        wheelPath1.lineTo(x - longX, y - longY);
        wheelPath1.lineTo(x - longX, y + longY);
        wheelPath1.moveTo(x, y);
        wheelPath1.lineTo(x + longY, y);
        wheelPath1.lineTo(x + longY, y - longX);
        wheelPath1.lineTo(x - longY, y - longX);
        wheelPath1.lineTo(x - longY, y);
        wheelPath1.lineTo(x, y);
        wheelPath1.moveTo(x, y);
        wheelPath1.closePath();
        const wheelGeometry1 = new THREE.ShapeGeometry(wheelPath1);
        const wheelMaterial = new THREE.MeshBasicMaterial({
          color: "black",
          side: THREE.DoubleSide,
        });
        const wheel1 = new THREE.Mesh(wheelGeometry1, wheelMaterial);

        const wheelPath2 = new THREE.Shape();
        wheelPath2.moveTo(x, y);
        wheelPath2.absarc(x, y, radius, startAngle, endAngle, clockwise);
        wheelPath2.absarc(x, y, radius, endAngle, startAngle, clockwise);
        wheelPath2.closePath();
        const wheelGeometry2 = new THREE.ShapeGeometry(wheelPath2);

        const wheel2 = new THREE.Mesh(wheelGeometry2, wheelMaterial);
        const wheel = new THREE.Group();
        wheel.add(wheel1);
        wheel.add(wheel2);

        const starPlayer = new THREE.Group();
        starPlayer.add(star);
        starPlayer.add(wheel);
        starPlayer.name = childName1;
        starPlayer.lookAt(0, 0, -1);
        starPlayer.rotateZ(Math.PI);
        scene.add(starPlayer);
        // Обновляем позицию круга
        starPlayer.position.set(
          player.character.location.x / divider - canvasWidth / 2,
          player.character.location.y / divider - canvasHeight / 2,
          0
        );
      } else {
        // Если персонаж вне транспортного средства, используем другой материал
        const starShape = new THREE.Shape();
        const outerRadius = 5;
        const innerRadius = 2;
        const numPoints = 5;
        let startAngle = 90;

        const initialAngleOffset = startAngle * (Math.PI / 180);

        for (let i = 0; i < numPoints * 2; i++) {
          const angle = (i / numPoints) * Math.PI + initialAngleOffset; // Добавляем смещение угла;
          const radius = i % 2 === 0 ? outerRadius : innerRadius;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          if (i === 0) {
            starShape.moveTo(x, y);
          } else {
            starShape.lineTo(x, y);
          }
        }
        starShape.closePath();

        const starGeometry = new THREE.ShapeGeometry(starShape);
        const starMaterial = new THREE.MeshBasicMaterial({
          color: teams[teamId].color,
          side: THREE.DoubleSide,
        });
        const starMesh = new THREE.Mesh(starGeometry, starMaterial);
        const outlineMaterial = new THREE.LineBasicMaterial({
          color: "black",
          linewidth: 2,
          side: THREE.DoubleSide,
        });
        const outlineGeometry = new THREE.EdgesGeometry(starGeometry);
        const outlineMesh = new THREE.LineSegments(
          outlineGeometry,
          outlineMaterial
        );

        const star = new THREE.Group();
        star.add(outlineMesh);
        star.add(starMesh);
        star.name = childName1;
        star.lookAt(0, 0, -1);
        star.rotateZ(Math.PI);
        star.scale.set(1.2, 1.2, 0);
        scene.add(star);
        // Обновляем позицию круга
        star.position.set(
          player.character.location.x / divider - canvasWidth / 2,
          player.character.location.y / divider - canvasHeight / 2,
          0
        );
      }
    });
    // Рендеринг сцены
    renderer.render(scene, camera);
  }
  //========================================================
  // Функция для отрисовки кольца
  function drawZones(time) {
    // Получаем все дочерние объекты сцены
    const allChildren = scene.children;
    const childName1 = "ringMesh_1";
    const childName2 = "ringMesh_2";
    const childName3 = "ringMesh_3";

    // Проходим по всем дочерним объектам
    for (let i = allChildren.length - 1; i >= 0; i--) {
      const child = allChildren[i];

      // Проверяем, имеет ли дочерний объект имя "ringMesh_1"
      if (
        child.name == childName1 ||
        child.name == childName2 ||
        child.name == childName3
      ) {
        // Удаляем дочерний объект из сцены
        scene.remove(child);
      }
    }

    const filteredEvents = gameStateDataArray.filter(
      (event) => Math.abs(event.eventTimeGet - time) <= timeDelay
    );

    filteredEvents.forEach((event) => {
      let ringGeometry1 = new THREE.RingGeometry(
        event.poisonGasWarningRadius / divider,
        event.poisonGasWarningRadius / divider + 1,
        32
      );
      let ringMaterial1 = new THREE.MeshBasicMaterial({
        color: "white",
        side: THREE.DoubleSide,
      });
      let ringMesh1 = new THREE.Mesh(ringGeometry1, ringMaterial1);
      ringMesh1.name = childName1;

      let ringGeometry2 = new THREE.RingGeometry(
        event.safetyZoneRadius / divider,
        1300,
        32
      );
      let ringMaterial2 = new THREE.MeshBasicMaterial({
        color: "blue",
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide,
      });
      let ringMesh2 = new THREE.Mesh(ringGeometry2, ringMaterial2);
      ringMesh2.name = childName2;

      let ringGeometry3 = new THREE.CircleGeometry(
        event.redZoneRadius / divider,
        32
      );
      let ringMaterial3 = new THREE.MeshBasicMaterial({
        color: "red",
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide,
      });
      let ringMesh3 = new THREE.Mesh(ringGeometry3, ringMaterial3);
      ringMesh3.name = childName3;

      scene.add(ringMesh1);
      scene.add(ringMesh2);
      scene.add(ringMesh3);

      ringMesh1.position.set(
        event.poisonGasWarningPosition.x / divider - canvasWidth / 2,
        event.poisonGasWarningPosition.y / divider - canvasHeight / 2,
        0
      );
      ringMesh2.position.set(
        event.safetyZonePosition.x / divider - canvasWidth / 2,
        event.safetyZonePosition.y / divider - canvasHeight / 2,
        0
      );
      ringMesh3.position.set(
        event.redZonePosition.x / divider - canvasWidth / 2,
        event.redZonePosition.y / divider - canvasHeight / 2,
        0
      );
    });
    // Рендеринг сцены
    renderer.render(scene, camera);
  }
  //========================================================
  function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }
  // animate();
});
