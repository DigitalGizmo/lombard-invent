<script>
  import { onMount, tick } from 'svelte'; //, tick
  import { tweened } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';
  import { draggable } from '@neodrag/svelte';
  import { slide } from 'svelte/transition';

  import challenges from './lib/challenges2.json';
  const assetPath = "https://assets.digitalgizmo.com/lombard-invent/"
  // const assetPath = ""
  let challengeIndex = 0;
  let challengePhaseIndex = 0;
  let chosenOptionIndex = 0;
  let isFeedback = false; // otherwise question/challenge
  let isMoreFeedbackShowing = false;
  let currentCorrectness = 0;
  let correctnessStates = [1, 1, 1, 1];
  let optionsToHide = ["", "", "", "", ""];
  const speed = 1; // Smaller is faster for working preview
  const longMoveDuration = 5000 * speed; // 5000
  const shortMoveDuration = 1000 * speed;
  // let vwidth = 1200;
  // let vheight = 800;
  let textVisible = true;
  let optionsVisible = false;
  let haulerScale = 1;
  const doneLabels = ["<span>Power</span>", "<span>Traction</span>", 
    "<span>Steering</span>", "<span>Cost</span>", "<span>Brakes</span>"];
  let doneStatus = [{isDone: false, label: ""}, {isDone: false, label: ""}, 
  {isDone: false, label: ""}, {isDone: false, label: ""}, {isDone: false, label: ""}
   ]
  // let test = true;
  let choiceObjectBounds = {top: 100, left:20, bottom:50, right:50};
  let optionPositions = [
    { x: 0, y: 0}, { x: 0, y: 0}, { x: 0, y: 0}, { x: 0, y: 0}
  ]

  // Temp array for progress audio names, should be in json
  const progressAudioNames = ['progress', 'progress-steam', 'progress-steam', 
    'progress-steam', 'progress-steam', 'progress-steam' ]
  // let audioName = "progress"
  let audioProgress = new Audio(assetPath + 'audio/progress.mp3')
  const audioIncorrect = new Audio(assetPath + 'audio/incorrect.mp3')
  const audioCorrect = new Audio(assetPath + 'audio/correct.mp3')
  const audioProgressSteam = new Audio(assetPath + 'audio/progress-audioProgressSteam.mp3')
  // $: audio = new Audio(assetPath + 'audio/' + audioName + '.mp3')


  // let optionAElement;
  let optionElements = [null, null, null, null];

  // let haulerLeft = 600;
  // let haulerTop = 400;
  let haulerWidth = 300;
  let haulerHeight = 250;
  // let option1Left = 300;
  let optionTop = 500;
  // let option1LandingX = 20;
  let option1LandingXOffset = 18;
  let optionLandingXOffsets = [20, 70, 120];
  let optionLandingYOffset = -100;

  async function calcHauler() {
    // Workaround for apparent bug - get the hauler twice here
    // and then again in calcOptionOffsets
    await tick();
    let hauler = document.getElementById('hauler');
    // console.log('1st rect: ' + hauler.getBoundingClientRect());
    let tempRect = hauler.getBoundingClientRect();
    setTimeout(() => {
      let rect = hauler.getBoundingClientRect();
      // haulerWidth =  Math.round(rect.width);
      haulerHeight = Math.round(rect.height);
      // console.log(' hauler height onMount in timeout: ' + haulerHeight);
    }, 10);
  }

  async function calcOptionOffsets() {
    await tick();
    // console.log('finished waiting')
    let hauler = document.getElementById('hauler');

    // console.log('1st rect: ' + hauler.getBoundingClientRect());
    setTimeout(() => {
      let rect = hauler.getBoundingClientRect();
      haulerWidth =  Math.round(rect.width);
      haulerHeight = Math.round(rect.height);

      // console.log('haulerLeft:' + rect.left + ' haulerTop:' + rect.top + 
      // ' haulerWidth:' + haulerWidth + ' haulerHeight:' + haulerHeight)

      // May need to create array and get each, but many not matter since
      // we never show the landed option
      // For now only 1 & 1
      for (let i = 0; i < 3; i++) {
        let optionRect = optionElements[i].getBoundingClientRect();
        optionLandingXOffsets[i] = rect.left - optionRect.left;
        optionTop = optionRect.top;
      }

      let optionRect = optionElements[0].getBoundingClientRect();
      // option1Left = optionRect.left;
      // option1LandingXOffset = rect.left - optionRect.left;  
      
      // optionTop = optionRect.top;
      // console.log('optionTop: ' + optionTop);
      optionLandingYOffset = -(Math.round(optionRect.top) - rect.top);  
      // console.log('distance from opt top to haul top: ' + optionLandingYOffset)
    }, 10);
  }  

  const cloudsX = tweened(0);
  const landX = tweened(0);

  // movement
  async function nextMove() {
    // console.log('before timeout')
    textVisible = false;
    optionsVisible = false;
    // audioName = "progress";
    audioProgress = new Audio(assetPath + 'audio/' + progressAudioNames[challengeIndex] + '.mp3')
    audioProgress.play();
    landX.update((landX) => landX - 50, {duration: longMoveDuration});
    await cloudsX.update((cloudsX) => cloudsX - 20, {duration: longMoveDuration});
    audioProgress.pause();
    setTimeout(() => {
      // console.log('after timeout')
      // chalengIndex change will change main "horse" image
      challengeIndex +=1;
      chosenOptionIndex = 0;
      optionsToHide = ["", "", "", "", ""];
      correctnessStates = [1, 1, 1, 1];
      // isFeedback = true;
      calcHauler();
      // make it kaput
      challengePhaseIndex = 1;
      // audioName = "incorrect";
      audioIncorrect.play();

      correctnessStates[0] = 0; // ? not used here, but creates error if gone

      displayChallengeText();
    }, 1000 * speed);
  }

  async function displayChallengeText() {
    setTimeout(() => {
      console.log('display challengeText. chalengIndex: ' + challengeIndex)
      isFeedback = false;
      textVisible = true;
      if (challengeIndex < 6) {
        displayOptions();
      }
    }, 1000 * speed);
  }

  async function displayOptions() {
    setTimeout(() => {
      console.log('display Options')
      optionsVisible = true;
      calcOptionOffsets();
    }, 2000 * speed);
  }

  // Short move for wrong
  async function shortMove( _chosenOptionIndex) {
    // await haulerX.update((haulerX) => haulerX + 10);
    audioProgress.play();
    landX.update((landX) => landX - 8, {duration: shortMoveDuration});
    await cloudsX.update((cloudsX) => cloudsX - 5, {duration: shortMoveDuration});
    audioProgress.pause();
    correctnessStates[_chosenOptionIndex] = currentCorrectness;
    audioIncorrect.play();
    // console.log('correctnessStates[' + _chosenOptionIndex + '] = ' + challenges[challengeIndex].options[chosenOptionIndex].correctness)
    displayFeedback();
  }  

  async function bingCorrect(_chosenOptionIndex) {
    // console.log(' -- bing Correct!');
    correctnessStates[_chosenOptionIndex] = currentCorrectness;
    // console.log('correctnessStates[' + _chosenOptionIndex + '] = ' + challenges[challengeIndex].options[chosenOptionIndex].correctness)
    await tick();
    audioCorrect.play();
    setTimeout(() => {
      haulerScale = 1.4;
      // console.log('setting scale 1.2')
      bingCorrectPart2();
    }, 500);
  }  

  async function bingCorrectPart2(_chosenOptionIndex) {
    // console.log(' -- bing Correct p 2');
    await tick();
    setTimeout(() => {
      haulerScale = 1;
      // console.log('setting scale 1.2')
      displayFeedback();
      audioCorrect.pause();
    }, 500);
  }  

  async function displayFeedback() {
    setTimeout(() => {
      console.log('display Feedback')
      isFeedback = true;
      textVisible = true;
      if (challengeIndex > 0 && currentCorrectness) {
        // minus 1 bcz json element 0 is intro
        doneStatus[challengeIndex - 1].label = doneLabels[challengeIndex - 1];
        doneStatus[challengeIndex - 1].isDone = true;
      }
    }, 1000 * speed);
  }

  async function onToNext() {
    setTimeout(() => {
      console.log('on to next challenge')
      optionsVisible = false;
      nextMove();
    }, 2000 * speed);
  }

  function dragStop(e, _chosenOptionIndex) { //  _chosenOptionIndex
    /* Landing position of a given option is relative to its start point
    * not relative to the viewport
    * All Y offset numbers are "upside down": negative numbers fro option start */
    // console.log('stoped at x: ' + e.detail.offsetX + ' y: ' +
    //   e.detail.offsetY)
    // Hide more feedback
    isMoreFeedbackShowing = false;
    console.log('opt index: ' + _chosenOptionIndex);
    if (e.detail.offsetX > optionLandingXOffsets[_chosenOptionIndex] - 30 && 
      e.detail.offsetX < (optionLandingXOffsets[_chosenOptionIndex] + haulerWidth - 80) &&
      e.detail.offsetY > optionLandingYOffset - 50 && // -400 is gt -500
      e.detail.offsetY < (optionLandingYOffset + haulerHeight - 30 ) 
      )
      // -400 is lt (-500 + 200) aka -400 is lt -300
      {
      // Set challengePhase to 2 to enable multi-factor image selection
      challengePhaseIndex = 2;
      // Hide option 
      optionsToHide[_chosenOptionIndex] = "hide-option";
      // This will change hauler image to the option one
      chosenOptionIndex = _chosenOptionIndex;
      // set to the correct image for now
      correctnessStates[0] = 1;
      // Put it away
      optionPositions[_chosenOptionIndex] = {x: 0, y: 0};
      // optionPositions[1].y = 0;
      // Trigger short movement
      textVisible = false;
      isFeedback = true;
      // Handle correctness
      currentCorrectness = Number(challenges[challengeIndex].options[chosenOptionIndex].correctness);
      // correctnessStates[_chosenOptionIndex] = currentCorrectness;
      if (currentCorrectness) {
        bingCorrect(_chosenOptionIndex);
      } else {
        shortMove( _chosenOptionIndex);
        // Short move will trigger feedback and options
      }

    } else { // back to home base
      optionPositions[_chosenOptionIndex] = {x: 0, y: 0};
    }
  }

  function toggleMoreFeedback() {
    isMoreFeedbackShowing = !isMoreFeedbackShowing
  }

  // function playSound() {
  //   audio.play();
  // }

</script>

<div class="wrapper">

  <div class="background">
    <img class="sky" src="{assetPath}images/sky-double.jpg"  alt="sky" 
      style="transform:translate({$cloudsX}vw, 0px)"
    />
    <img class="land" src="{assetPath}images/landscape-double.png" alt="land" 
      style="transform:translate({$landX}vw, 0px)"
    />
  </div>

  <header>
    <h1>Be The Inventor</h1>
  </header>

  <div class="hauler">
    <img src="{assetPath}images/lumber.png" alt="lumber"/>
    <!-- correctnessStates has been set chosen index by chosen index
     in the array -->
    {#if challengePhaseIndex < 2}
      <img src="{assetPath}images/hauler/{challenges[challengeIndex].challengePhase[challengePhaseIndex].imageName}.png" 
      style="transform:scale({haulerScale})"
      alt="{challenges[challengeIndex].challengePhase[challengePhaseIndex].imageName}" id="hauler"/>
    {:else}
      <img src="{assetPath}images/hauler/{challenges[challengeIndex].challengePhase[2].optionChosen[chosenOptionIndex][correctnessStates[chosenOptionIndex]].imageName}.png"
      style="transform:scale({haulerScale})"
      alt="{challenges[challengeIndex].challengePhase[challengePhaseIndex].imageName}" id="hauler"/>

    {/if}
    

  </div>

  <article>
    <header class="text-box"><!-- the challenge numbers -->
      <ul class="progress">
        <li class="progress-item" class:done={doneStatus[0].isDone}> 
          1 {@html doneStatus[0].label}
        </li>
        <li class="progress-item" class:done={doneStatus[1].isDone}> 
          2 {@html doneStatus[1].label}
        </li>
        <li class="progress-item" class:done={doneStatus[2].isDone}> 
          3 {@html doneStatus[2].label}
        </li>
        <li class="progress-item" class:done={doneStatus[3].isDone}> 
          4 {@html doneStatus[3].label}
        </li>
        <li class="progress-item" class:done={doneStatus[4].isDone}> 
          5 {@html doneStatus[4].label}
        </li>
      </ul>
    </header>
    <h2>{challenges[challengeIndex].title}</h2>
    {#if textVisible}
      {#if isFeedback}
        <div class="feedback">
          <p>{challenges[challengeIndex].options[chosenOptionIndex].feedback} 
            <a href="/" on:click={(e) => { e.preventDefault(); 
              toggleMoreFeedback();}}>
              {isMoreFeedbackShowing ? "Less..." : "More.."}
            </a>
          </p>
          {#if isMoreFeedbackShowing}
            <p
            transition:slide>{challenges[challengeIndex].options[chosenOptionIndex].moreFeedback}</p>
          {/if}
        </div>

        {#if currentCorrectness}
          <button on:click={nextMove}>
            {challengeIndex < 5 ? "Next Challenge" : "Start Hauling Logs!"}
          </button>
        {/if}           

      {:else}
        <!-- this is question/challenge -->
        <p>{challenges[challengeIndex].challengeText} </p>
        {#if challengeIndex === 0}
          <button on:click={nextMove}>
            start
          </button>
        {/if}   
      {/if}
    {/if}
    <!-- <p>Debug: 
      {challenges[challengeIndex].challengePhase[2].optionChosen[chosenOptionIndex][correctnessStates[chosenOptionIndex]].imageName} <br>
      challengeIndex: {challengeIndex} <br>
      challengePhaseIndex: {challengePhaseIndex} <br>
      chosenOptionIndex: {chosenOptionIndex},  <br>
      correctnessStates[chosenOptionIndex]: {correctnessStates[chosenOptionIndex]}
      challenges[challengeIndex].options[0].imageName: {challenges[challengeIndex].options[0].imageName}
    </p> -->

  </article>

  <!-- {#if challengeIndex === 1} -->
  {#if optionsVisible}
    <div class="options">
      <div class="option1" >
        <img src="{assetPath}images/options/{challenges[challengeIndex].options[0].imageName}-shadow.png" alt="oxen shadow"
        class="can-be-overlayed">
        <img src="{assetPath}images/options/{challenges[challengeIndex].options[0].imageName}.png" 
          class="{optionsToHide[0]}"
          id="optionA" alt="option 1: oxen" 
          bind:this={optionElements[0]}
          use:draggable={{ 
            position: optionPositions[0],
            bounds: choiceObjectBounds,
            onDrag: ({offsetX, offsetY}) => {
              optionPositions[0] = {x: offsetX, y: offsetY};
            }
          }}  
          on:neodrag:end={(e) => dragStop(e, 0)}     
        />
        <h3>{challenges[challengeIndex].options[0].label}</h3>
      </div>

      <div class="option2">
        <img src="{assetPath}images/options/{challenges[challengeIndex].options[1].imageName}-shadow.png" alt="tractor shadow"
        class="can-be-overlayed">
        <img src="{assetPath}images/options/{challenges[challengeIndex].options[1].imageName}.png" 
          class="{optionsToHide[1]}"
          id="optionA" alt="option 2: tractor" 
          bind:this={optionElements[1]}
          use:draggable={{ 
            position: optionPositions[1],
            bounds: choiceObjectBounds,
            onDrag: ({offsetX, offsetY}) => {
              optionPositions[1] = {x: offsetX, y: offsetY};
            }
          }}  
          on:neodrag:end={(e) => dragStop(e, 1)}     
        />
        <h3>{challenges[challengeIndex].options[1].label}</h3>
      </div>

      <div class="option3">
        <img src="{assetPath}images/options/{challenges[challengeIndex].options[2].imageName}-shadow.png" alt="tractor shadow"
        class="can-be-overlayed">
        <img src="{assetPath}images/options/{challenges[challengeIndex].options[2].imageName}.png" 
          class="{optionsToHide[2]}"
          id="optionA" alt="option 2: tractor" 
          bind:this={optionElements[2]}
          use:draggable={{ 
            position: optionPositions[2],
            bounds: choiceObjectBounds,
            onDrag: ({offsetX, offsetY}) => {
              optionPositions[2] = {x: offsetX, y: offsetY};
            }
          }}  
          on:neodrag:end={(e) => dragStop(e, 2)}     
        />
        <h3>{challenges[challengeIndex].options[2].label}</h3>
      </div>

    </div>
  {/if}

</div><!--/wrapper-->
