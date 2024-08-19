<script>
  import { onMount, tick } from 'svelte'; //, tick
  import { tweened } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';
  import { draggable } from '@neodrag/svelte';

  import challenges from './lib/challenges.json';
  const assetPath = "https://dev.digitalgizmo.com/msm-ed/lombard-invent-assets/"
  // const assetPath = ""
  let challengeIndex = 0;
  let chosenOptionIndex = 0;
  let isFeedback = false; // otherwise question/challenge
  let currentCorrectness = 0;
  let correctnessStates = [1, 1, 1, 1];
  let optionsToHide = ["", "", "", "", ""];
  const movementDuration = 5000; // 5000
  // let vwidth = 1200;
  // let vheight = 800;
  let textVisible = true;
  let optionsVisible = false;

  let choiceObjectBounds = {top: 100, left:20, bottom:50, right:50};
  let optionPositions = [
    { x: 0, y: 0}, { x: 0, y: 0}, { x: 0, y: 0}, { x: 0, y: 0}
  ]

  let optionAElement;
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
      console.log(' hauler height onMount in timeout: ' + haulerHeight);
    }, 10);
  }

  async function calcOptionOffsets() {
    await tick();
    console.log('finished waiting')
    let hauler = document.getElementById('hauler');

    console.log('1st rect: ' + hauler.getBoundingClientRect());
    setTimeout(() => {
      let rect = hauler.getBoundingClientRect();
      haulerWidth =  Math.round(rect.width);
      haulerHeight = Math.round(rect.height);

      console.log('haulerLeft:' + rect.left + ' haulerTop:' + rect.top + 
      ' haulerWidth:' + haulerWidth + ' haulerHeight:' + haulerHeight)

      // May need to create array and get each, but many not matter since
      // we never show the landed option
      // For now only 1 & 1
      for (let i = 1; i < 3; i++) {
        let optionRect = optionElements[i].getBoundingClientRect();
        optionLandingXOffsets[i] = rect.left - optionRect.left;
        optionTop = optionRect.top;
      }


      let optionRect = optionElements[1].getBoundingClientRect();
      // option1Left = optionRect.left;
      // option1LandingXOffset = rect.left - optionRect.left;  
      
      // optionTop = optionRect.top;
      console.log('optionTop: ' + optionTop);
      optionLandingYOffset = -(Math.round(optionRect.top) - rect.top);  
      console.log('distance from opt top to haul top: ' + optionLandingYOffset)
    }, 10);
  }  

  const cloudsX = tweened(0, {
    duration: movementDuration,
    easing: cubicOut
  });
  const landX = tweened(0, {
    duration: movementDuration,
    easing: cubicOut
  });

  // movement
  async function nextMove() {
    // console.log('before timeout')
    textVisible = false;
    landX.update((landX) => landX - 15);
    await cloudsX.update((cloudsX) => cloudsX - 8);
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
      correctnessStates[0] = 0;
      displayQuestion();
    }, 1000);
  }

  async function displayQuestion() {
    setTimeout(() => {
      console.log('display challengeText')
      isFeedback = false;
      textVisible = true;
      displayOptions();
    }, 2000);
  }

  async function displayOptions() {
    setTimeout(() => {
      console.log('display Options')
      optionsVisible = true;
      calcOptionOffsets();
    }, 2000);
  }

  // Short move for wring
  async function shortMove( _chosenOptionIndex) {
    // await haulerX.update((haulerX) => haulerX + 10);
    // textVisible = false;
    landX.update((landX) => landX - 5);
    await cloudsX.update((cloudsX) => cloudsX - 3);
    currentCorrectness = Number(challenges[challengeIndex].options[chosenOptionIndex].correctness);
    correctnessStates[_chosenOptionIndex] = currentCorrectness;

    // correctnessStates = correctnessStates;

    console.log('correctnessStates[' + _chosenOptionIndex + '] = ' + challenges[challengeIndex].options[chosenOptionIndex].correctness)

    displayFeedback();
  }  

  async function displayFeedback() {
    setTimeout(() => {
      console.log('display Feedback')
      isFeedback = true;
      textVisible = true;
      if (currentCorrectness) {
        console.log('--- we are going to continue!')
        onToNext();
      }
    }, 2000);
  }

  async function onToNext() {
    setTimeout(() => {
      console.log('on to next challenge')
      optionsVisible = false;
      nextMove();
    }, 2000);
  }

  function dragStop(e, _chosenOptionIndex) { //  _chosenOptionIndex
    /* Landing position of a given option is relative to its start point
    * not relative to the viewport
    * All Y offset numbers are "upside down": negative numbers fro option start */
    // console.log('stoped at x: ' + e.detail.offsetX + ' y: ' +
    //   e.detail.offsetY)
    console.log('opt index: ' + _chosenOptionIndex);
    if (e.detail.offsetX > optionLandingXOffsets[_chosenOptionIndex] && 
      e.detail.offsetX < (optionLandingXOffsets[_chosenOptionIndex] + haulerWidth - 40) &&
      e.detail.offsetY > optionLandingYOffset && // -400 is gt -500
      e.detail.offsetY < (optionLandingYOffset + haulerHeight - 30 ) 
      // -400 is lt (-500 + 200) aka -400 is lt -300
    ) {
      // index change will change main "horse" image
      // No longer stick option on target
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
      shortMove( _chosenOptionIndex);
      // Short move will trigger feedback and options
    } else { // back to home base
      optionPositions[_chosenOptionIndex] = {x: 0, y: 0};
    }
  }
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
    <h1>Be An Inventor</h1>
    <ul class="progress">
      <li>1</li>
      <li>2</li>
      <li>3</li>
      <li>4</li>
      <li>5</li>
    </ul>
  </header>

  <div class="hauler">
    <img src="{assetPath}images/lumber.png" alt="lumber"/>
    <!-- correctnessStates has been set chosen index by chosen index
     in the array -->
    <img src="{assetPath}images/{challenges[challengeIndex].options[chosenOptionIndex].correctnessStateImages[correctnessStates[chosenOptionIndex]].imageName}.png" 
    alt="horses" id="hauler"/>
  </div>

  <article>
    {#if textVisible}
      <h2>{challenges[challengeIndex].title}</h2>
      {#if isFeedback}
        <!-- <p>{challenges[challengeIndex].options[0].feedback} </p> -->
        <p>{challenges[challengeIndex].options[chosenOptionIndex].feedback} </p>
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
      challengeIndex: {challengeIndex}, <br>
      chosenOptionIndex: {chosenOptionIndex},  <br>
      correctnessStates: {correctnessStates}, <br>
      currentCorrectness: {currentCorrectness},  <br>
      correctnessStates[currentCorrectness], {correctnessStates[currentCorrectness]} <br>
      imageName: {challenges[challengeIndex].options[chosenOptionIndex].correctnessStateImages[correctnessStates[currentCorrectness]].imageName},
    </p> -->
      <!-- imageName: {challenges[challengeIndex].options[chosenOptionIndex].correctnessStateImages[correctnessState].imageName} -->

  </article>

  <!-- {#if challengeIndex === 1} -->
  {#if optionsVisible}
    <div class="options">
      <div class="option1" >
        <img src="{assetPath}images/oxen-shadow.png" alt="oxen shadow"
        class="can-be-overlayed">
        <img src="{assetPath}images/{challenges[challengeIndex].options[1].correctnessStateImages[correctnessStates[1]].imageName}.png" 
          class="{optionsToHide[1]}"
          id="optionA" alt="option 1: oxen" 
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
        <h3>Oxen</h3>
      </div>
      <div class="option2">
        <img src="{assetPath}images/tractor-shadow.png" alt="tractor shadow"
        class="can-be-overlayed">
        <img src="{assetPath}images/{challenges[challengeIndex].options[2].correctnessStateImages[correctnessStates[2]].imageName}.png" 
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
        <h3>Steam Tractor</h3>
      </div>
      <div class="option3">
        <img src="{assetPath}images/trolley.png" alt="option 3: trolly" />
        <h3>Electric Trolly</h3>
      </div>
    </div>
  {/if}

</div><!--/wrapper-->

<style>
  .hide-option {
    visibility: hidden;
  }

  .can-be-overlayed {
    position: absolute;
  }
</style>