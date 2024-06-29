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

document.addEventListener("DOMContentLoaded", async function () {
  let playerName = document.getElementById("playerName").value;
  // const mapCanvas = document.getElementById("mapCanvas");
  // const mapCtx = mapCanvas.getContext("2d");
  const playerCanvas = document.getElementById("playerCanvas");
  // const playerCtx = playerCanvas.getContext("2d");
  const timeSlider = document.getElementById("timeSlider");
  const currentTimeText = document.getElementById("currentTime");
  const playerNameInput = document.getElementById("playerName");
  const platform = document.getElementById("platform");
  const match = document.getElementById("match");
  const playButton = document.getElementById("playButton");
  const stopButton = document.getElementById("stopButton");
  const canvasPlayer = document.getElementById("canvasPlayer");
  // const canvasPlayer = document.getElementsByClassName("canvasPlayer");
  const canvasPlayerDiv = document.querySelector(".canvasPlayer");

  let startTime, endTime;
  let startTimeMatch, endTimeMatch;

  // Размеры канваса
  const canvasWidth = 819;
  const canvasHeight = 819;

  // Divider
  let divider;
  let matchTime = [];
  let minTime, maxTime;
  let data; // Переменная для хранения загруженных данных JSON
  try {
    data = await fetchData(
      // "https://telemetry-cdn.pubg.com/bluehole-pubg/steam/2024/06/11/16/16/f087fa15-280d-11ef-b494-7ab82fa5e467-telemetry.json"
      // "https://telemetry-cdn.pubg.com/bluehole-pubg/steam/2024/06/19/16/28/f400189f-2e58-11ef-8e53-52efdb7423b0-telemetry.json"
      // "https://telemetry-cdn.pubg.com/bluehole-pubg/steam/2024/06/23/15/42/3b56d623-3177-11ef-a6eb-0ecd5821fde8-telemetry.json"
      "https://telemetry-cdn.pubg.com/bluehole-pubg/steam/2024/06/25/16/40/abea74c1-3311-11ef-9440-4eb6a2a5c7ee-telemetry.json"
      // "https://telemetry-cdn.pubg.com/bluehole-pubg/steam/2024/06/27/16/45/a56992ca-34a4-11ef-9799-eae35b87f06c-telemetry.json"
    );
  } catch (error) {
    console.error("Ошибка при загрузке данных:", error);
  }

  data.forEach((item) => {
    const date = new Date(item._D);
    // console.log(date);
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
  // timeSlider.step = 1; // Шаг в миллисекундах

  let timeDelay = 5000;
  let teams = {};
  let teamId = "";
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
    // console.log(teams);
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
  if (
    matchStartMapName === "Baltic_Main" ||
    matchStartMapName === "Erangel_Main"
  ) {
    mapName = "Erangel";
    mapTexture = loader.load("public/map/map_Baltic_Main.png");
    divider = 1000;
  }
  if (matchStartMapName === "Chimera_Main") {
    mapName = "Paramo";
    mapTexture = loader.load("public/map/map_Chimera_Main.png");
    divider = 375;
  }
  if (matchStartMapName === "Desert_Main") {
    mapName = "Miramar";
    mapTexture = loader.load(
      // "Miramar_Main_Low_Res.png"
      "public/map/map_Desert_Main.png"
    );
    divider = 1000;
  }
  if (matchStartMapName === "DihorOtok_Main") {
    mapName = "Vikendi";
    mapTexture = loader.load("public/map/map_DihorOtok_Main.png");
    divider = 1000;
  }
  if (matchStartMapName === "Heaven_Main") {
    mapName = "Heaven";
    mapTexture = loader.load("public/map/map_Heaven_Main.png");
    divider = 125;
  }
  if (matchStartMapName === "Kiki_Main") {
    mapName = "Deston";
    mapTexture = loader.load("public/map/map_Kiki_Main.png");
    divider = 1000;
  }
  if (matchStartMapName === "Range_Main") {
    mapName = "Camp Jackal";
    mapTexture = loader.load("public/map/map_Range_Main.png");
    divider = 250;
  }
  if (matchStartMapName === "Savage_Main") {
    mapName = "Sanhok";
    mapTexture = loader.load("public/map/map_Savage_Main.png");
    divider = 500;
  }
  if (matchStartMapName === "Summerland_Main") {
    mapName = "Karakin";
    mapTexture = loader.load("public/map/map_Summerland_Main.png");
    divider = 250;
  }
  if (matchStartMapName === "Tiger_Main") {
    mapName = "Taego";
    mapTexture = loader.load("public/map/map_Tiger_Main.png");
    divider = 1000;
  }
  if (matchStartMapName === "Neon_Main") {
    mapName = "Rondo";
    mapTexture = loader.load("public/map/map_Neon_Main.png");
    divider = 1000;
  }
  //========================================================
  // console.log(logMatchStartArray);
  // console.log(gameStateDataArray);
  // console.log(logVehicleRideArray);
  // console.log(logVehicleLeaveArray);
  // console.log(logVehicleLeaveArrayArray);
  // console.log(logPlayerCreateArray);
  // console.log(teams);
  console.log("logPlayerAttackArray", logPlayerAttackArray.length);
  console.log("logPlayerKillV2Array", logPlayerKillV2Array.length);
  // console.log("logPlayerMakeGroggyArray", logPlayerMakeGroggyArray.length);
  // console.log("logPlayerTakeDamageArray", logPlayerTakeDamageArray.length);
  // console.log(logMatchStartArray[0].characters.length);
  // console.log(logCarePackageLandArray);
  // console.log(logCarePackageSpawnArray);
  // console.log(logItemPickupFromCarepackageArray);

  // COLORS = [
  //   "#942B6C",
  //   "#A6D2F5",
  //   "#5BCB89",
  //   "#CD3537",
  //   "#7A0E2A",
  //   "#62AA3E",
  //   "#C42159",
  //   "#CE8958",
  //   "#8A3ED5",
  //   "#5FC9CB",
  //   "#205541",
  //   "#AD2E5B",
  //   "#F979E2",
  //   "#9E61C4",
  //   "#1683A6",
  //   "#3AFBA7",
  //   "#1AA357",
  //   "#5D8893",
  //   "#F89E56",
  //   "#47C523",
  //   "#9EEB36",
  //   "#D11FCE",
  //   "#38363D",
  //   "#C1323A",
  //   "#71EB85",
  //   "#2DD25B",
  //   "#E95B80",
  //   "#0A1A06",
  //   "#814817",
  //   "#B4B36E",
  //   "#EAA302",
  //   "#F5B592",
  //   "#B55B73",
  //   "#BE15AA",
  //   "#ACD985",
  //   "#72B3DC",
  //   "#89FE43",
  //   "#A811FD",
  //   "#70A2F1",
  //   "#664298",
  //   "#4EC808",
  //   "#BD0FB4",
  //   "#2504EF",
  //   "#BDB408",
  //   "#3C4403",
  //   "#745AEB",
  //   "#9EDF2E",
  //   "#496124",
  //   "#7191A3",
  //   "#956960",
  //   "#EE2873",
  //   "#BD42F2",
  //   "#38DB60",
  //   "#50B3FF",
  //   "#DF9413",
  //   "#A563B8",
  //   "#448ECC",
  //   "#C71859",
  //   "#2B7126",
  //   "#791C85",
  //   "#02C483",
  //   "#2BB2B5",
  //   "#19961B",
  //   "#8D3E9E",
  //   "#DDF0EE",
  //   "#3FF44A",
  //   "#4AAACD",
  //   "#D5B3CA",
  //   "#FE5D3C",
  //   "#A5EA3E",
  //   "#B6E779",
  //   "#C88575",
  //   "#8449EA",
  //   "#FDEE02",
  //   "#8CA755",
  //   "#1025CF",
  //   "#D15138",
  //   "#00E067",
  //   "#D3B254",
  //   "#FE716A",
  //   "#5B0D71",
  //   "#A87B02",
  //   "#1EBB55",
  //   "#6859E3",
  //   "#0D40CF",
  //   "#1AA5D4",
  //   "#B843F4",
  //   "#0D35E0",
  //   "#571A51",
  //   "#1B4606",
  //   "#4359F8",
  //   "#A8E9F3",
  //   "#1DFACF",
  //   "#D726DD",
  //   "#A5529E",
  //   "#AD6E63",
  //   "#CD9B91",
  //   "#3C734F",
  //   "#6B5360",
  //   "#19EB15",
  // ];

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
  // scene.background = "black";
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

  const camera = new THREE.OrthographicCamera(
    0,
    canvasWidth,
    canvasHeight,
    0,
    -1000,
    2000
  );
  // const camera = new THREE.OrthographicCamera(
  //   canvasWidth / -2,
  //   canvasWidth / 2,
  //   canvasHeight / 2,
  //   canvasHeight / -2,
  //   -1000,
  //   2000
  // );
  // camera.position.set(0, 0, -1);
  // camera.position.z *= -1; // Изменяем знак координаты z
  camera.lookAt(0, 0, 1);
  // camera.lookAt(canvasWidth / 2, canvasHeight / 2, 1);
  camera.rotateZ(Math.PI);
  camera.position.set(-canvasWidth / 2, canvasHeight / 2, -1);
  // camera.position.z *= -1; // Изменяем знак координаты z
  // camera.lookAt(canvasWidth / 2, canvasHeight / 2, 0);
  // camera.rotateZ(Math.PI);

  const wheelTexture = loader.load(
    // "D:/Denis/Programming/JS/wheel.png"
    "M:/NextJS/playerPUBG/public/picture/wheel.png"
  );
  const crossTexture = loader.load(
    // "D:/Denis/Programming/JS/death.png"
    // "D:/Denis/Programming/JS/cross.png"
    "M:/NextJS/playerPUBG/public/picture/cross0.png"
    // "M:/NextJS/playerPUBG/public/picture/death.png"
    // "M:/NextJS/playerPUBG/public/picture/skull.png"
  );
  const carePackageTexture = loader.load(
    // "D:/Denis/Programming/JS/carepackage.png"
    "M:/NextJS/playerPUBG/public/picture/carepackage.png"
  );

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

  // =================================
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
  // ========================================================================
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

  // // Добавляем обработчик события
  // canvasPlayer[0].addEventListener("wheel", onWheel, { passive: false });
  // ========================================================================

  function generateSequence(start, end, step) {
    let sequence = [];
    for (let i = start; i <= end; i += step) {
      sequence.push(i);
    }
    return sequence;
  }

  let numbers = generateSequence(startTime, endTime, timeDelay);

  timeSlider.oninput = function () {
    const time = this.valueAsNumber;
    // console.log("-----");
    console.log(time);
    const timeInSeconds = time / 1000 - startTime / 1000;

    drawFlyingLine();
    updatePlayerPositions(time);
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
  };

  let index = 0; // Индекс для перебора массива numbers
  let shouldContinue = true; // Флаг для контроля выполнения

  function nextTime() {
    if (shouldContinue && index < numbers.length) {
      const time = numbers[index];
      updatePlayerPositions(time);
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

  playButton.addEventListener("click", function () {
    shouldContinue = true;
    // index = lastIndex;
    // startTimePlayer = lastStartTime;
    nextTime();
  });
  stopButton.addEventListener("click", function () {
    shouldContinue = false;
  });

  function drawLine(ctx, startX, startY, endX, endY) {
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = "white";
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  function playerTakeDamage(time) {
    const childName = "shootLine2";
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
      const points = [pointsKiller, pointsVictim];
      // points.push(pointsKiller);
      // points.push(pointsVictim);

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

  function playerDeath(time) {
    // Получаем все дочерние объекты сцены
    // const allChildren = scene.children;
    const childName = "playerDeath";
    // Проходим по всем дочерним объектам
    // for (let i = allChildren.length - 1; i >= 0; i--) {
    //   const child = allChildren[i];
    //   // Проверяем, имеет ли дочерний объект имя
    //   if (child.name === childName) {
    //     // Удаляем дочерний объект из сцены
    //     scene.remove(child);
    //   }
    // }
    const filteredEvents = logPlayerKillV2Array.filter(
      (event) => Math.abs(event.eventTimeGet - time) <= timeDelay
    );
    filteredEvents.forEach((event) => {
      const victim = event.victim;
      if (victim) {
        const teamId = victim.teamId;
        const startX = event.victim.location.x / divider;
        const startY = event.victim.location.y / divider;
        let planeGeometry = new THREE.PlaneGeometry(
          crossTexture.image.width,
          crossTexture.image.height
        );
        let planeMaterial = new THREE.MeshBasicMaterial({
          map: crossTexture,
          color: teams[teamId].color,
          side: THREE.DoubleSide,
        });
        let plane = new THREE.Mesh(planeGeometry, planeMaterial);
        plane.name = childName;
        plane.lookAt(0, 0, -1);
        plane.rotateZ(Math.PI);
        scene.add(plane);
        plane.position.set(startX - canvasWidth / 2, startY - canvasHeight / 2);
      }
    });
    renderer.render(scene, camera);
  }

  function carePackage(time) {
    // Получаем все дочерние объекты сцены
    // const allChildren = scene.children;
    const childName = "carePackage";
    // Проходим по всем дочерним объектам
    // for (let i = allChildren.length - 1; i >= 0; i--) {
    //   const child = allChildren[i];
    //   // Проверяем, имеет ли дочерний объект имя
    //   if (child.name === childName) {
    //     // Удаляем дочерний объект из сцены
    //     scene.remove(child);
    //   }
    // }
    const filteredEvents = logCarePackageLandArray.filter(
      (event) => Math.abs(event.eventTimeGet - time) <= timeDelay
    );
    filteredEvents.forEach((event) => {
      const itemPackage = event.itemPackage;
      if (itemPackage) {
        const startX = event.itemPackage.location.x / divider;
        const startY = event.itemPackage.location.y / divider;
        let planeGeometry = new THREE.PlaneGeometry(
          carePackageTexture.image.width,
          carePackageTexture.image.height
        );
        let planeMaterial = new THREE.MeshBasicMaterial({
          map: carePackageTexture,
          side: THREE.DoubleSide,
        });
        let plane = new THREE.Mesh(planeGeometry, planeMaterial);
        plane.name = childName;
        plane.lookAt(0, 0, -1);
        plane.rotateZ(Math.PI);
        scene.add(plane);
        plane.position.set(startX - canvasWidth / 2, startY - canvasHeight / 2);
      }
    });
    renderer.render(scene, camera);
  }

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

  function updatePlayerPositions(time) {
    // Получаем все дочерние объекты сцены
    const allChildren = scene.children;
    const childName = "circle_1";
    // Проходим по всем дочерним объектам
    for (let i = allChildren.length - 1; i >= 0; i--) {
      const child = allChildren[i];
      // Проверяем, имеет ли дочерний объект имя "circle_1"
      if (child.name === childName) {
        // Удаляем дочерний объект из сцены
        scene.remove(child);
      }
    }

    // const filteredPlayers = logPlayerPositionArray.filter(
    //   (player) => player.character.name && player.elapsedTime == time
    // );
    const filteredPlayers = logPlayerPositionArray.filter(
      (player) =>
        player.character.name &&
        Math.abs(player.eventTimeGet - time) <= timeDelay
    );

    filteredPlayers.forEach((player) => {
      const teamId = player.character.teamId;

      const isInVehicle = isCharacterInVehicle(player.character.name, time);

      let material1;
      if (isInVehicle) {
        // if (logVehicle) {
        // Если персонаж внутри транспортного средства, используем текстуру
        material1 = new THREE.MeshBasicMaterial({
          map: wheelTexture,
          color: teams[teamId].color,
          side: THREE.DoubleSide,
        });
      } else {
        // Если персонаж вне транспортного средства, используем другой материал
        material1 = new THREE.MeshBasicMaterial({
          color: teams[teamId].color,
          side: THREE.DoubleSide,
        });
      }
      let geometry1 = new THREE.CircleGeometry(4, 16);
      // let material1 = new THREE.MeshBasicMaterial({
      //   // map: wheelTexture,
      //   // color: "white",
      //   color: teams[teamId].color,
      //   side: THREE.DoubleSide,
      // });
      // const mesh1 = new THREE.Mesh(geometry1, material1);

      let geometry2 = new THREE.RingGeometry(3, 5, 16);
      let material2 = new THREE.MeshBasicMaterial({
        color: "black",
        side: THREE.DoubleSide,
      });
      // const mesh2 = new THREE.Mesh(geometry2, material2);

      let circle = scene.getObjectByName(player.name);

      if (!circle) {
        const mesh1 = new THREE.Mesh(geometry1, material1);
        const mesh2 = new THREE.Mesh(geometry2, material2);
        // circle = mesh1.add(mesh2);
        circle = new THREE.Group();
        circle.add(mesh1);
        circle.add(mesh2);
        circle.name = childName;
        scene.add(circle);
      }
      // Обновляем позицию круга
      circle.position.set(
        player.character.location.x / divider - canvasWidth / 2,
        player.character.location.y / divider - canvasHeight / 2,
        0
      );
    });
    // Рендеринг сцены
    renderer.render(scene, camera);
  }

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

  function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }
  // animate();
});
