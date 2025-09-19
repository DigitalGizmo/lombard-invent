<script>
  import { onMount, onDestroy } from 'svelte';
  import { tick } from 'svelte'; //, onMount, ˜
  import { tweened } from 'svelte/motion';
  // import { cubicOut } from 'svelte/easing';
  import { linear } from 'svelte/easing';
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
    assetPath = "https://mainestatemuseum.org/lombard-invent/";
    challengeIndex = 0;
  } else {
    // assetPath = "";
    assetPath = "https://assets.digitalgizmo.com/lombard-invent/"
    challengeIndex = 7;
  }

  let challengePhaseIndex = 0;
  let chosenOptionIndex = 0;
  let showFeedback = false; // otherwise question/challenge
  let showIncorrectFBColor = false;
  let isMoreFeedbackShowing = false;
  let hintHasBeenShown = false;
  let isModalShowing = false;
  let currentCorrectness = 0;
  let correctnessStates = [1, 1, 1, 1];
  let optionsToHide = ["", "", "", "", ""];
  const speed = 0.3 // 0.3; // Smaller is faster for working preview, default = 1, fast = 0.3
  const longMoveDuration = 5000 * speed; // 5000
  const shortMoveDuration = 1000 * speed;
  // const attractDuration = 34000 * speed;
  let textVisible = true;
  let titleVisible = true;
  let optionsVisible = false;
  let isBoxVisible = true;
  let dynoTitle = "Be The Inventor";
  let attractAnimationRunning = true; // Flag to control animation loop

  let haulerScale = 1;
  const doneLabels = ["<span>Power</span>", "<span>Traction</span>", 
    "<span>Steering</span>", "<span>Cost</span>", "<span>Brakes</span>"];
  // doneLabels are for the 1, 2, 3 etc bubbles at the top of text box
  let doneStatus = [{progNumClass: "", label: ""}, {progNumClass: "", label: ""}, 
  {progNumClass: "", label: ""}, {progNumClass: "", label: ""}, {progNumClass: "", label: ""}
   ]
  // let test = true;
  let choiceObjectBounds = {top: 100, left:20, bottom:50, right:50};
  let optionPositions = [
    { x: 0, y: 0}, { x: 0, y: 0}, { x: 0, y: 0}, { x: 0, y: 0}
  ]
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

  // These values may need adjustment based on your image dimensions
  const skyWidth = 390; // Width of sky image in vw
  const landWidth = 440; // 139 w 2500 Width of land image in vw
  // Animation speed variables
  const ATTRACT_SKY_SPEED = 0.06;  // * 3 pixels per frame
  const ATTRACT_LAND_SPEED = 0.12;  //  * 3 pixels per frame
  let animationFrameId = null;

  // Kiosk timeout functionality
  const TIMEOUT_DURATION = (120000 * speed) // 60000 = 1 minute; // 1000 per second  (milliseconds)
  let timeoutId;

  // Reset on timeout and define what will happen upon timeout
  // Modify the resetTimeout function to properly cancel any existing animation before restarting
  // Also update resetTimeout to clear any existing timeout
  function resetTimeout() {
    console.log(' got to resetTimeout. challengeIndex: ' + challengeIndex);
    if (buildMode === 2) {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      
      // Don't set a new timeout if we're in attract mode
      if (challengeIndex === 7) return;
      
      timeoutId = setTimeout(() => {
        console.log(' -- inside setTimeout. challengeIndex: ' + challengeIndex);
        
        // First stop any existing animation
        if (attractAnimationRunning) {
          attractAnimationRunning = false;
          if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
          }
        }
        
        // Reset game state
        challengeIndex = 7; // Set to attract screen
        isModalShowing = false;
        challengePhaseIndex = 0;
        chosenOptionIndex = 0;
        showFeedback = false;
        isMoreFeedbackShowing = false;
        hintHasBeenShown = false;
        currentCorrectness = 0;
        correctnessStates = [1, 1, 1, 1];
        optionsToHide = ["", "", "", "", ""];
        optionsVisible = false;
        textVisible = true;
        titleVisible = true;
        doneStatus = [{progNumClass: "current", label: ""}, {progNumClass: "", label: ""}, 
        {progNumClass: "", label: ""}, {progNumClass: "", label: ""}, {progNumClass: "", label: ""}
        ]
        
        // Reset animation values
        landX.set(0, {duration: 0});
        skyX.set(0, {duration: 0});
        
        // Start attract mode animation
        setTimeout(() => {
          attractAnimationRunning = true;
          attract();
        }, 100);
      }, TIMEOUT_DURATION);
    }
  }

  function clearKioskTimeout() {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }

  // Modify the handleUserActivity function to only reset timeout when not in attract mode
  function handleUserActivity() {
    if (buildMode === 2 && challengeIndex !== 7) {
      // Only reset timeout when not in attract mode (attract mode is index 7)
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

      for (let i = 0; i < 3; i++) {
        let optionRect = optionElements[i].getBoundingClientRect();
        optionLandingXOffsets[i] = rect.left - optionRect.left;
        optionTop = optionRect.top;
      }

      let optionRect = optionElements[0].getBoundingClientRect();
      optionLandingYOffset = -(Math.round(optionRect.top) - rect.top);  
      // console.log('distance from opt top to haul top: ' + optionLandingYOffset)
    }, 10);
  }  

  // Update tweened store creation to use linear easing by default
  const skyX = tweened(0, {
    duration: 400,
    easing: linear
  });
  
  const landX = tweened(0, {
    duration: 400,
    easing: linear
  });

  // Function to check and reposition images when they move off-screen
  // Improved implementation for checkAndRepositionImages that avoids any transition
  function checkAndRepositionImages() {
    // Using immediate repositioning with no transition
    if ($skyX <= -skyWidth) {
      skyX.set($skyX + skyWidth, { duration: 0 });
    }
    
    if ($landX <= -landWidth) {
      landX.set($landX + landWidth, { duration: 0 });
    }
  }

  // Improved continuous scrolling animation
  // Modify the attract function to ensure it only starts one animation loop
  function attract() {
    if (!attractAnimationRunning) return;
    
    // Cancel any existing animation frame first
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
    
    let lastTime = performance.now();

    audioProgress = new Audio(assetPath + 'audio/progress-attract.mp3')
      audioProgress.play();
    
    function animate(currentTime) {
      if (!attractAnimationRunning) {
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
          animationFrameId = null;
        }
        return;
      }
      
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;
      
      // Update positions based on time elapsed (smoother than fixed increments)
      skyX.update(x => {
        const newX = x - ATTRACT_SKY_SPEED * (deltaTime / 16.67); // normalized to ~60fps
        // Reposition immediately if passed threshold (no animation)
        if (newX <= -skyWidth) {
          return newX + skyWidth;
        }
        return newX;
      }, { duration: 0 }); // No duration for continuous movement
      
      landX.update(x => {
        const newX = x - ATTRACT_LAND_SPEED * (deltaTime / 16.67); // normalized to ~60fps
        // Reposition immediately if passed threshold (no animation)
        if (newX <= -landWidth) {
          return newX + landWidth;
        }
        return newX;
      }, { duration: 0 }); // No duration for continuous movement
      
      // Continue animation
      animationFrameId = requestAnimationFrame(animate);
    }
    
    // Start animation loop
    animationFrameId = requestAnimationFrame(animate);
  }
  // End attract loop
  // Also modify the begin function to ensure proper cleanup
  // Update the begin function to ensure proper timeout management
  function begin() {
    // Stop the animation loop
    attractAnimationRunning = false;
    // Stop audio
    audioProgress.pause();
    // Cancel the animation frame
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
    
    // Cancel current animations
    landX.set($landX);
    skyX.set($skyX);
    
    challengeIndex = 0;
    
    // Now we're leaving attract mode, so start the timeout
    if (buildMode === 2) {
      resetTimeout(); 
    }
    
    isBoxVisible = false;

    // Now call nextMove
    nextMove(true); // true: isAttract
  }

  // movement to next challenge
  async function nextMove(_isFromAttract=false) {
    textVisible = false;
    optionsVisible = false;
    isFrozen = false;
    hintHasBeenShown = false;
    
    // titleVisible = false;
    if (challengeIndex === 5){
      dynoTitle = "You solved many challenges!";
    } else if (challengeIndex > 0) {
      dynoTitle = challenges[challengeIndex].title + " solved! On to the next Challenge";
    }

    handleUserActivity();
    
    console.log(' ** nextMove, challengeIndex before increment: ' + challengeIndex);

    // reset to phase 0
    challengePhaseIndex = 0;
    // Increment before timeuout so that next challenge image shows
    challengeIndex +=1;
    // console.log(' in nextMove after increment');
    // console.log('-- nextMove, audio: ' + "audio/" + 

    // If we're coming here from the attract screen, then we don't play the move
    // since we were already moving
    if (!_isFromAttract) {
      audioProgress = new Audio(assetPath + 'audio/' + 
        challenges[challengeIndex].challengePhase[0].audio + '.mp3')
      audioProgress.play();
      
      // Use linear easing explicitly for this movement
      landX.update(x => x - 50, {duration: longMoveDuration, easing: linear});
      await skyX.update(x => x - 20, {duration: longMoveDuration, easing: linear});
      audioProgress.pause();
      
      checkAndRepositionImages();
    }

    setTimeout(() => {
      // Increment first so we can suppress options in display challengeText
      // console.log(' in setTimeout before increment');
      // moving this to before timeuout
      console.log(' in setTimeout after increment, chal index: ' + challengeIndex);
      // Don't do all these steps when we've finished last challenge
      if ( challengeIndex < 9){
        chosenOptionIndex = 0;
        optionsToHide = ["", "", "", "", ""];
        correctnessStates = [1, 1, 1, 1];
        // showFeedback = true;
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
      // Reset timeout becuse the travel looks like inactivity
      handleUserActivity();

      // Fudge -1 because index has already been incremented
      if (challengeIndex < 6) {
        doneStatus[challengeIndex-1].progNumClass = "current";
      }
      
      displayChallengeText();
    }, 1000 * speed);
  }

  // movement to next challenge
  async function retry() {
    // console.log('before timeout')
    optionsVisible = false;
    isFrozen = false;
    showFeedback = false;
    // textVisible = false;
    // titleVisible = false;
    handleUserActivity();

    setTimeout(() => {
      // console.log('after timeout')
      // chalengIndex change will change main "horse" image
      // challengeIndex +=1;
      chosenOptionIndex = 0;
      optionsToHide = ["", "", "", "", ""];
      correctnessStates = [1, 1, 1, 1];
      // showFeedback = true;
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
    if (challengeIndex === 6) {
      dynoTitle = challenges[challengeIndex].title;
    } else {
      dynoTitle = challengeIndex + ". The " + challenges[challengeIndex].title + " Challenge";
    }
    setTimeout(() => {
      console.log('display challengeText. chalengIndex: ' + challengeIndex)

      isBoxVisible = true;

      showFeedback = false;
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
    landX.update(x => x - 8, {duration: shortMoveDuration, easing: linear});
    await skyX.update(x => x - 5, {duration: shortMoveDuration, easing: linear});
    audioProgress.pause();
    
    checkAndRepositionImages();

    correctnessStates[_chosenOptionIndex] = currentCorrectness;
    // console.log('- in shortMove -- set bg color to incorrect');
    showIncorrectFBColor = true;
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
    // console.log(' -- bing Correct p 2 -- leave or reset to  default color');
    showIncorrectFBColor = false;
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
      showFeedback = true;
      textVisible = true;
      if (challengeIndex > 0 && currentCorrectness) {
        // minus 1 bcz json element 0 is intro
        doneStatus[challengeIndex - 1].label = doneLabels[challengeIndex - 1];
        doneStatus[challengeIndex - 1].progNumClass = "done";
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
    hintHasBeenShown = true;
    // console.log('opt index: ' + _chosenOptionIndex);
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
      // dont remove challenge text
      // textVisible = false;
      // Hide feedback until motion stops
      showFeedback = false;
      // Handle correctness
      currentCorrectness = Number(challenges[challengeIndex].options[chosenOptionIndex].correctness);
      // Trigger short movement
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

  // Update the onMount function to be more careful about animation initialization
  // Modify onMount to not start timeout if in attract mode
  onMount(() => {
    if (buildMode === 2) {
      // Make sure animation isn't running yet
      attractAnimationRunning = false;
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
      
      // Only set timeout if not in attract mode
      if (challengeIndex !== 7) {
        resetTimeout();
      }
      
      // Add event listeners for user activity
      window.addEventListener('click', handleUserActivity);
      window.addEventListener('touchstart', handleUserActivity);
      window.addEventListener('mousemove', handleUserActivity);
      window.addEventListener('keydown', handleUserActivity);
      
      // Start attract loop after a brief delay
      if (challengeIndex === 7) {
        setTimeout(() => {
          attractAnimationRunning = true;
          attract();
        }, 100);
      }
    }
  });

  onDestroy(() => {
    if (buildMode === 2) {
      // Stop animations
      attractAnimationRunning = false;
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
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
    <!-- Two sky images for continuous scrolling -->
    <img class="sky sky1" src="{assetPath}images/sky-double.jpg" alt="sky" 
      style="transform:translate({$skyX}vw, -3px)"
    />
    <img class="sky sky2" src="{assetPath}images/sky-double.jpg" alt="sky" 
      style="transform:translate({$skyX + skyWidth}vw, -3px)"
    />
    
    <!-- Two land images for continuous scrolling -->
    <img class="land land1" src="{assetPath}images/land-8000.png" alt="land" 
      style="transform:translate({$landX}vw, 0px)"
    />
    <img class="land land2" src="{assetPath}images/land-8000.png" alt="land" 
      style="transform:translate({$landX + landWidth}vw, 0px)"
    />
  </div>

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

  {#if challengeIndex === 7}
    <div class="idle">
      <h3>Be the Inventor!</h3>
      <p>Your challenge is to invent a machine to haul logs out of the forest!</p>
      <button on:click={begin}>
        Let's start inventing!
      </button>
    </div>
  {:else if isBoxVisible}
    <article>
      <header class="text-box"><!-- the challenge numbers -->
        <ul class="progress">
          <li class="progress-item {doneStatus[0].progNumClass}"> 
            1 {@html doneStatus[0].label}
          </li>
          <li class="progress-item {doneStatus[1].progNumClass}"> 
            2 {@html doneStatus[1].label}
          </li>
          <li class="progress-item {doneStatus[2].progNumClass}" > 
            3 {@html doneStatus[2].label}
          </li>
          <li class="progress-item {doneStatus[3].progNumClass}" > 
            4 {@html doneStatus[3].label}
          </li>
          <li class="progress-item {doneStatus[4].progNumClass}" > 
            5 {@html doneStatus[4].label}
          </li>
        </ul>
      </header>
      {#if titleVisible}
        <h2>{dynoTitle}</h2>
      {/if}
      {#if textVisible}
        <p>{challenges[challengeIndex].challengeText} </p>
        {#if challengeIndex === 0}
          <button on:click={(e) => {nextMove(false);}}>
            start
          </button>
        {/if}   
        {#if challenges[challengeIndex].challengeHint &&
          !showFeedback && !hintHasBeenShown }
          <p class=challenge-prompt>{challenges[challengeIndex].challengeHint}</p>
        {/if}   
        {#if showFeedback}
          <div class="feedback {showIncorrectFBColor ? "incorrect" : ""}">
            <p><span>{challenges[challengeIndex].options[chosenOptionIndex].feedback}</span><br>
            {challenges[challengeIndex].options[chosenOptionIndex].moreFeedback}</p>
          </div><!-- /feedback -->

          {#if currentCorrectness}
            <!-- Should this be 5 or 6? -->
            <!-- {#if challengeIndex < 5}  -->
              <button on:click={retry}>
                Replay Challenge
              </button>
            <!-- {/if} -->
            <button on:click={(e) => {nextMove(false);}}>
              {challengeIndex < 5 ? "Next Challenge" : "Start Hauling Logs!"}
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
  {/if} <!-- end if not attract (7) -->

  <p class="credits">
    <a href="/" 
      on:click={(e) => { e.preventDefault(); showModal();}}>
      Credits
    </a>
    &nbsp;|&nbsp;
    <a href="/">Start Over</a>
  </p>

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
