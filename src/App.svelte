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
  let correctnessState = 0;
  let optionToHide = "";
  const movementDuration = 5000; // 5000
  // let vwidth = 1200;
  // let vheight = 800;
  let textVisible = true;
  let optionsVisible = false;

  let choiceObjectBounds = {top: 100, left:20, bottom:50, right:50};
  let positionA = { x: 0, y: 0};

  let optionAElement;

  // let haulerLeft = 600;
  // let haulerTop = 400;
  let haulerWidth = 300;
  let haulerHeight = 250;
  // let option1Left = 300;
  let optionTop = 500;
  // let option1LandingX = 20;
  let option1LandingXOffset = 18;
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

      let optionARect = optionAElement.getBoundingClientRect();
      // option1Left = optionARect.left;
      optionTop = optionARect.top;
      console.log('optionTop: ' + optionTop);
      option1LandingXOffset = rect.left - optionARect.left;  
      optionLandingYOffset = -(Math.round(optionARect.top) - rect.top);  
      console.log('distance from opt top to haul top: ' + optionLandingYOffset)
    }, 10);
  }  

  // $: if (challengeIndex === 1) {
  //   console.log('just turned 1')
  //   calcOptionOffsets();
  // }

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
    console.log('before timeout')
    textVisible = false;

    landX.update((landX) => landX - 15);
    await cloudsX.update((cloudsX) => cloudsX - 8);

    setTimeout(() => {
      console.log('after timeout')
      // correctnessState = 1;
      // chalengIndex change will change main "horse" image
      challengeIndex +=1;
      // isFeedback = true;
      calcHauler();
      displayQuestion();
    }, 1000);
  }

  async function displayQuestion() {
    setTimeout(() => {
      console.log('display Question')
      isFeedback = false;
      textVisible = true;
      displayOptions();
    }, 2000);
  }
  async function displayFeedback() {
    setTimeout(() => {
      console.log('display Feedback')
      isFeedback = true;
      textVisible = true;
    }, 2000);
  }

  async function displayOptions() {
    setTimeout(() => {
      console.log('display Options')
      optionsVisible = true;
      calcOptionOffsets();
    }, 3000);
  }

  // Short move for wring
  async function shortMove() {
    // await haulerX.update((haulerX) => haulerX + 10);
    // textVisible = false;
    landX.update((landX) => landX - 5);
    await cloudsX.update((cloudsX) => cloudsX - 3);
    correctnessState = 1;
    displayFeedback();
  }

  function dragStop(e) {
    /* Landing position of a given option is relative to its start point
    * not relative to the viewport
    * All Y offset numbers are "upside down": negative numbers fro option start */
    console.log('stoped at x: ' + e.detail.offsetX + ' y: ' +
      e.detail.offsetY)
    if (e.detail.offsetX > option1LandingXOffset && 
      e.detail.offsetX < (option1LandingXOffset + haulerWidth - 40) &&
      e.detail.offsetY > optionLandingYOffset && // -400 is gt -500
      e.detail.offsetY < (optionLandingYOffset + haulerHeight - 30 ) 
      // -400 is lt (-500 + 200) aka -400 is lt -300
    ) {
      // // determine feedback
      // isFeedback = true;
      // // index change will change main "horse" image
      // No longer stick option on target
      // positionA = {x: option1LandingXOffset, 
      //   y: optionLandingYOffset} 
      // Hide option instead
      optionToHide = "hide-option";
      chosenOptionIndex = 1;
      // Put it away
      positionA = {x: 0, y: 0}
      // Trigger short movement
      textVisible = false;
      isFeedback = true;
      shortMove();
      // Short move will trigger feedback and options
    } else { // back to home base
      positionA = {x: 0, y: 0} // defaultBx
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
    <img src="{assetPath}images/{challenges[challengeIndex].options[chosenOptionIndex].correctnessStates[correctnessState].imageName}.png" 
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
        <p>{challenges[challengeIndex].question} </p>
        {#if challengeIndex === 0}
          <button on:click={nextMove}>
            start
          </button>
        {/if}   
      {/if}
    {/if}
    <!-- <p>Debug: challengeIndex: {challengeIndex}, 
      chosenOptionIndex: {chosenOptionIndex},
      correctnessState: {correctnessState},
      imageName: {challenges[challengeIndex].options[chosenOptionIndex].correctnessStates[correctnessState].imageName}
    </p> -->

  </article>

  <!-- {#if challengeIndex === 1} -->
  {#if optionsVisible}
    <div class="options">
      <div class="option1" >

        <img src="{assetPath}images/oxen-shadow.png" alt="oxen shadow"
        class="can-be-overlayed">
      
        <img src="{assetPath}images/{challenges[challengeIndex].options[1].correctnessStates[correctnessState].imageName}.png" 
          class="{optionToHide}"
          id="optionA" alt="option 1: oxen" 
          bind:this={optionAElement}
          use:draggable={{ 
            position: positionA,
            bounds: choiceObjectBounds,
            onDrag: ({offsetX, offsetY}) => {
              positionA = {x: offsetX, y: offsetY};
            }
          }}  
          on:neodrag:end={dragStop}      
        />
        <h3>Oxen</h3>
      </div>
      <div class="option2">
        <img src="{assetPath}images/tractor.png" alt="option 2: steam" />
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