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
  let isFeedback = false;
  let correctnessState = 0;
  let optionToHide = "";
  const movementDuration = 2000; // 5000
  // let vwidth = 1200;
  // let vheight = 800;

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

  onMount(async() => {
    await tick();
    let hauler = document.getElementById('hauler');
    // haulerLeft = Math.round(rect.left);
    // haulerTop = Math.round(rect.top);
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
  })

  $: if (challengeIndex === 1) {
    console.log('just turned 1')
    // calcHaulerOffsets();
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
    // stillHauling = true;
    // await haulerX.update((haulerX) => haulerX + 10);
    landX.update((landX) => landX - 15);
    await cloudsX.update((cloudsX) => cloudsX - 8);
    // stillHauling = false;
    challengeIndex +=1;
  }

  // Short move for wring
  async function shortMove() {
    // stillHauling = true;
    // await haulerX.update((haulerX) => haulerX + 10);
    landX.update((landX) => landX - 5);
    await cloudsX.update((cloudsX) => cloudsX - 3);
    // stillHauling = false;
    // challengeIndex +=1;
    // Kaput the current main hauling image
    correctnessState = 1;
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
      // stick on target
      // hide option version of imag
      // positionA = {x: option1LandingXOffset, 
      //   y: optionLandingYOffset} 
      // determine feedback
      isFeedback = true;
      // index change will change main "horse" image
      chosenOptionIndex = 1;
      // Hide the option image 
      optionToHide = "hide-option";
      // Put it away
      positionA = {x: 0, y: 0}
      // Need to trigger short movement
      shortMove();
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
    <h2>{challenges[challengeIndex].title}</h2>
    {#if isFeedback}
      <!-- <p>{challenges[challengeIndex].options[0].feedback} </p> -->
      <p>{challenges[challengeIndex].options[chosenOptionIndex].feedback} </p>
    {:else}
      <p>{challenges[challengeIndex].question} </p>
      {#if challengeIndex === 0}
        <button on:click={nextMove}>
          start
        </button>
      {/if}   
    {/if}
    <!-- <p>
      -- vwidth:  haulerLeft: not a var 
      haulerHeight: {haulerHeight} 
      option1LandingXOffset: {option1LandingXOffset}
      optionLandingYOffset: {optionLandingYOffset}
    </p> -->

  </article>

  <div class="options">
    <div class="option1" >
      
      <!-- {#if challengeIndex === 1} -->
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
      <!-- {:else}
          <img src="{assetPath}images/option-blank.png" 
          alt="option 1: oxen"/>
      {/if} -->


      </div>
      <div class="option2">
        <img src="{assetPath}images/option-steam-tractor.png" alt="option 2: steam" />
        <h3>Steam Tractor</h3>
      </div>
      <div class="option3">
        <img src="{assetPath}images/option-trolly.png" alt="option 3: trolly" />
        <h3>Electric Trolly</h3>
      </div>
    </div>
  
</div><!--/wrapper-->

<style>
  .hide-option {
    visibility: hidden;
  }
</style>