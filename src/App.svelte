<script>
  import { onMount, onDestroy } from 'svelte';
  import { tick } from 'svelte'; //, onMount, ˜
  import { tweened } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';
  import { draggable, } from '@neodrag/svelte';
  import { slide } from 'svelte/transition';
  // import { fade } from 'svelte/transition';

  import challenges from './lib/challenges2.json';
  import Credits from './Credits.svelte';

  let assetPath = "https://assets.digitalgizmo.com/lombard-invent/";
  let challengeIndex = 0;

  let buildMode = 2;
  // buildMode: 0 = devel, 1 web, 2 = kiosk
  if (buildMode === 0) {
    assetPath = "https://assets.digitalgizmo.com/lombard-invent/"
    challengeIndex = 0;
  } else if (buildMode === 1) {
    assetPath = "https://mainestetemuseum.org/lombard-invent/";
    challengeIndex = 0;
  } else {
    assetPath = "";
    challengeIndex = 7;
  }

  let challengePhaseIndex = 0;
  let chosenOptionIndex = 0;
  let isFeedback = false; // otherwise question/challenge
  let isMoreFeedbackShowing = false;
  let isModalShowing = false;
  let currentCorrectness = 0;
  let correctnessStates = [1, 1, 1, 1];
  let optionsToHide = ["", "", "", "", ""];
  const speed = 0.3; // Smaller is faster for working preview, default = 1, fast = 0.3
  const longMoveDuration = 5000 * speed; // 5000
  const shortMoveDuration = 1000 * speed;
  // let vwidth = 1200;
  // let vheight = 800;
  let textVisible = true;
  let titleVisible = true;
  let optionsVisible = false;
  let haulerScale = 1;
  const doneLabels = ["<span>Power</span>", "<span>Traction</span>", 
    "<span>Steering</span>", "<span>Cost</span>", "<span>Brakes</span>"];
  // doneLabels are for the 1, 2, 3 etc bubbles at the top of text box
  let doneStatus = [{isDone: false, label: ""}, {isDone: false, label: ""}, 
  {isDone: false, label: ""}, {isDone: false, label: ""}, {isDone: false, label: ""}
   ]
  // let test = true;
  let choiceObjectBounds = {top: 100, left:20, bottom:50, right:50};
  let optionPositions = [
    { x: 0, y: 0}, { x: 0, y: 0}, { x: 0, y: 0}, { x: 0, y: 0}
  ]
  // Temp array for progress audio names, should be in json
  // const progressAudioNames = ['progress', 'progress-steam', 'progress-steam', 
  //   'progress-steam', 'progress-steam', 'progress-steam' ]
  // let audioName = "progress"
  let audioProgress = new Audio(assetPath + 'audio/progress.mp3')
  let audioEndTravel = new Audio(assetPath + 'audio/incorrect.mp3')
  let audioOption = new Audio(assetPath + 'audio/incorrect.mp3')
  // const audioCorrect = new Audio(assetPath + 'audio/correct.mp3')

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
  // In order to freeze on correct, awaiting retry
  let isFrozen = false;

  // Kiosk timeout functionality
  const TIMEOUT_DURATION = 8000; // 120000 2 minutes in milliseconds
  let timeoutId;

  // In your resetTimeout function:
  function resetTimeout() {
    console.log(' got to resetTimeout. challengeIndex: ' + challengeIndex);
    if (buildMode === 2) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        console.log(' -- inside setTimeout. challengeIndex: ' + challengeIndex);
        // Reset game state
        challengeIndex = 7; // Set to attract screen
        isModalShowing = false;
        challengePhaseIndex = 0;
        chosenOptionIndex = 0;
        isFeedback = false;
        isMoreFeedbackShowing = false;
        currentCorrectness = 0;
        correctnessStates = [1, 1, 1, 1];
        optionsToHide = ["", "", "", "", ""];
        optionsVisible = false;
        textVisible = true;
        titleVisible = true;
      }, TIMEOUT_DURATION);
    }
  }


  function clearKioskTimeout() {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }

  function handleUserActivity() {
    if (buildMode === 2) {
      resetTimeout();
    }
  }
  
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

  // End attract loop
  function begin() {
    challengeIndex = 0;
    handleUserActivity();
  }

  // if (buildMode === 2 && (challengeIndex !== 7 || isModalShowing)) {
  //   resetTimeout();
  // }    

  // movement to next challenge
  async function nextMove() {
    textVisible = false;
    titleVisible = false;
    optionsVisible = false;
    isFrozen = false;

    handleUserActivity();
    
    console.log(' ** nextMove, challengeIndex before increment: ' + challengeIndex);

    // reset to phase 0
    challengePhaseIndex = 0;
    // Increment before timeuout so that next challenge image shows
    challengeIndex +=1;
    // console.log(' in nextMove after increment');
    // console.log('-- nextMove, audio: ' + "audio/" + 
    // challenges[challengeIndex].challengePhase[0].audio + '.mp3');
    audioProgress = new Audio(assetPath + 'audio/' + 
      challenges[challengeIndex].challengePhase[0].audio + '.mp3')
    audioProgress.play();
    
    landX.update((landX) => landX - 50, {duration: longMoveDuration});
    await cloudsX.update((cloudsX) => cloudsX - 20, {duration: longMoveDuration});
    audioProgress.pause();

    setTimeout(() => {
      // Increment first so we can suppress options in display challengeText
      // console.log(' in setTimeout before increment');
      // moving this to before timeuout
      // challengeIndex +=1;
      console.log(' in setTimeout after increment, chal index: ' + challengeIndex);
      // Don't do all these steps when we've finished last challenge
      if ( challengeIndex < 9){
        chosenOptionIndex = 0;
        optionsToHide = ["", "", "", "", ""];
        correctnessStates = [1, 1, 1, 1];
        // isFeedback = true;
        calcHauler();
        // make it kaput
        challengePhaseIndex = 1;
        // Usually incorrect, but success on last chanllenge
        if (challengeIndex < 6) {

          audioEndTravel = new Audio(assetPath + 'audio/' + 
          challenges[challengeIndex].challengePhase[1].audio + '.mp3')
          audioEndTravel.play();
        }
  
        correctnessStates[0] = 0; // ? not used here, but creates error if gone
      }
      displayChallengeText();
    }, 1000 * speed);
  }

  // movement to next challenge
  async function retry() {
    // console.log('before timeout')
    textVisible = false;
    titleVisible = false;
    optionsVisible = false;
    isFrozen = false;

    handleUserActivity();

    setTimeout(() => {
      // console.log('after timeout')
      // chalengIndex change will change main "horse" image
      // challengeIndex +=1;
      chosenOptionIndex = 0;
      optionsToHide = ["", "", "", "", ""];
      correctnessStates = [1, 1, 1, 1];
      // isFeedback = true;
      // calcHauler();
      // make it kaput
      challengePhaseIndex = 1;
      audioEndTravel = new Audio(assetPath + 'audio/' + 
        challenges[challengeIndex].challengePhase[1].audio + '.mp3')
      audioEndTravel.play();
  
      correctnessStates[0] = 0; // ? not used here, but creates error if gone

      displayChallengeText();
    }, 1000 * speed);
  }

  async function displayChallengeText() {
    titleVisible = true;
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

    handleUserActivity();

    audioProgress.play();
    landX.update((landX) => landX - 8, {duration: shortMoveDuration});
    await cloudsX.update((cloudsX) => cloudsX - 5, {duration: shortMoveDuration});
    audioProgress.pause();
    correctnessStates[_chosenOptionIndex] = currentCorrectness;
    // console.log('- about to set audio in shortMove');
    audioOption = new Audio(assetPath + 'audio/' + 
        challenges[challengeIndex].options[_chosenOptionIndex].audioFeedback + '.mp3')

    // Some options have animations as determined by third "correctness" state
    if (challenges[challengeIndex].challengePhase[2].optionChosen[chosenOptionIndex].length > 2) {
      setTimeout(() => {
        // console.log('- trying kaput2')
        correctnessStates[_chosenOptionIndex] = 2;

        audioOption.play();
        displayFeedback();
      }, 1000);
    } else {
      audioOption.play();
      displayFeedback();
    }
  }  

  async function bingCorrect(_chosenOptionIndex) {
    // console.log(' -- bing Correct!');
    correctnessStates[_chosenOptionIndex] = currentCorrectness;
    // console.log('correctnessStates[' + _chosenOptionIndex + '] = ' + challenges[challengeIndex].options[chosenOptionIndex].correctness)
    await tick();

    audioOption = new Audio(assetPath + 'audio/' + 
        challenges[challengeIndex].options[_chosenOptionIndex].audioFeedback + '.mp3')

    audioOption.play();

    // Need to freeze option dragging -- retry required to try those
    isFrozen = true;
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
      audioOption.pause();
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

  function showModal() { 
    console.log('got to showModal')
    isModalShowing = true;
  };  


  onMount(() => {
    if (buildMode === 2) {
      // Initial timeout setup
      resetTimeout();
      // Add event listeners for user activity
      window.addEventListener('click', handleUserActivity);
      window.addEventListener('touchstart', handleUserActivity);
      window.addEventListener('mousemove', handleUserActivity);
      window.addEventListener('keydown', handleUserActivity);
    }
  });

  onDestroy(() => {
    if (buildMode === 2) {
      // Clean up event listeners and timeout
      window.removeEventListener('click', handleUserActivity);
      window.removeEventListener('touchstart', handleUserActivity);
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
      clearKioskTimeout();
    }
  });  
</script>

<div class="wrapper">

  <div class="background">
    <img class="sky" src="{assetPath}images/sky-double.jpg"  alt="sky" 
      style="transform:translate({$cloudsX}vw, 0px)"
    />
    <img class="land" src="{assetPath}images/landscape-double.png" alt="land" 
      style="transform:translate({$landX}vw, 0px)"
    />
  </div><!-- /background -->

  <header>
    <h1>Be The Inventor</h1>
  </header>

  <div class="hauler">
    <img src="{assetPath}images/lumber.png" alt="lumber" class="logs" />
    <!-- image during travel  0 = travel, 1 = kaput -->
     <!-- Could use a fade, but we'd need to do some absolute positoning to avoid jump
     transition:fade={{ duration: 500}} -->
    {#if challengePhaseIndex < 2}
      <img 
      src="{assetPath}images/hauler/{challenges[challengeIndex].challengePhase[challengePhaseIndex].imageName}.png" 
      style="transform:scale({haulerScale})"
      alt="{challenges[challengeIndex].challengePhase[challengePhaseIndex].imageName}" id="hauler"/>

    <!-- image while options are chosen 
      correctnessStates has been set chosen index by chosen index in the array ??
      For animation: could reverse 0 & 1 and add a 2 -- or just go from 0 to 2 for animation
      e.g. 
      <img src="{assetPath}images/hauler/{challenges[5th].challengePhase[2-options].optionChosen[1][0=kaput or correct; 1=attempt that travels].imageName}.png"/>
      -->
    {:else}
      <img 
      src="{assetPath}images/hauler/{challenges[challengeIndex].challengePhase[2].optionChosen[chosenOptionIndex][correctnessStates[chosenOptionIndex]].imageName}.png"
      style="transform:scale({haulerScale})"
      alt="{challenges[challengeIndex].challengePhase[challengePhaseIndex].imageName}" id="hauler"/>
    {/if}
    
  </div><!-- /hauler -->

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
    {#if titleVisible}
      <h2>{challenges[challengeIndex].title}</h2>

    {/if}
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
        </div><!-- /feedback -->

        {#if currentCorrectness}
          <button on:click={nextMove}>
            {challengeIndex < 5 ? "Next Challenge" : "Start Hauling Logs!"}
          </button>
          <!-- Should this be 5 or 6? -->
          <!-- {#if challengeIndex < 5}  -->
            <button on:click={retry}>
              Replay Challenge
            </button>
          <!-- {/if} -->
        {/if}           

      {:else} <!-- this is question/challenge -->
        <p>{challenges[challengeIndex].challengeText} </p>
        {#if challengeIndex === 0}
          <button on:click={nextMove}>
            start
          </button>
        {/if}   
        {#if challengeIndex === 7}
        <button on:click={begin}>
          tap to begin
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

  <p class="credits">
    <a href="/" 
      on:click={(e) => { e.preventDefault(); showModal();}}>
      Credits
    </a>
  </p>
  
  <!-- {#if challengeIndex === 1} -->
  {#if optionsVisible}
    <ul class="options">
      <li class="option1" >
        <img src="{assetPath}images/options/shadow1.png" alt="option1 shadow"
        class="shadows">
        <img src="{assetPath}images/options/{challenges[challengeIndex].options[0].imageName}.png" 
          class="{optionsToHide[0]}"
          id="optionA" alt="option 1" 
          bind:this={optionElements[0]}
          use:draggable={{ 
            disabled: isFrozen,
            position: optionPositions[0],
            bounds: choiceObjectBounds,
            onDrag: ({offsetX, offsetY}) => {
              optionPositions[0] = {x: offsetX, y: offsetY};
            }
          }}  
          on:neodrag:end={(e) => dragStop(e, 0)}     
        />
        <h3>{challenges[challengeIndex].options[0].label}</h3>
      </li>

      <li class="option2">
        <img src="{assetPath}images/options/shadow2.png" alt="option2 shadow"
        class="shadows">
        <img src="{assetPath}images/options/{challenges[challengeIndex].options[1].imageName}.png" 
          class="{optionsToHide[1]}"
          id="optionA" alt="option 2" 
          bind:this={optionElements[1]}
          use:draggable={{ 
            disabled: isFrozen,
            position: optionPositions[1],
            bounds: choiceObjectBounds,
            onDrag: ({offsetX, offsetY}) => {
              optionPositions[1] = {x: offsetX, y: offsetY};
            }
          }}  
          on:neodrag:end={(e) => dragStop(e, 1)}     
        />
        <h3>{challenges[challengeIndex].options[1].label}</h3>
      </li>

      <li class="option3">
        <img src="{assetPath}images/options/shadow3.png" alt="option3 shadow"
        class="shadows">
        <img src="{assetPath}images/options/{challenges[challengeIndex].options[2].imageName}.png" 
          class="{optionsToHide[2]}"
          id="optionA" alt="option 3" 
          bind:this={optionElements[2]}
          use:draggable={{ 
            disabled: isFrozen,
            position: optionPositions[2],
            bounds: choiceObjectBounds,
            onDrag: ({offsetX, offsetY}) => {
              optionPositions[2] = {x: offsetX, y: offsetY};
            }
          }}  
          on:neodrag:end={(e) => dragStop(e, 2)}     
        />
        <h3>{challenges[challengeIndex].options[2].label}</h3>
      </li>

    </ul>
  {/if}
  
</div><!--/wrapper-->

{#if isModalShowing}
  <Credits 
    bind:isModalShowing 
  />
{/if}  
