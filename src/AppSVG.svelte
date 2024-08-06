<script>
  import { onMount } from 'svelte'; //, tick
  import { tweened } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';
  import { draggable } from '@neodrag/svelte';

  import challenges from './lib/challenges.json';

  let frameHeight = 900;
  let popQuestion = false;
  let viewSvgRatio = 1;
  
  let challengeIndex = -1;
  // let question = challenges[0].question;
  const movementDuration = 6000;

  let choiceObjectBounds = {top: 100, left:20, bottom:200, right:100};
  // let choiceObjectBounds = ".image-panel-image";
  let positionB = { x: 300, y: 0};
  let positionX = { x: 0, y: 0};

  let vwidth = 1600;
  onMount(() => {
    vwidth = Math.max(document.documentElement.clientWidth || 
      0, window.innerWidth || 0);
    viewSvgRatio = 1600/vwidth;
    positionB = { x: 300*viewSvgRatio, y:0};
  })

  const haulerX = tweened(100, {
    duration: movementDuration,
    easing: cubicOut
  });
  
  let stillHauling = false;

  async function handleHauler() {
  // function handleHauler() {
    stillHauling = true;
    // $haulerX += 300;
    landX.update((landX) => landX - 400);
    cloudsX.update((cloudsX) => cloudsX - 200);
    await haulerX.update((haulerX) => haulerX + 100);
    stillHauling = false;
    challengeIndex +=1;
  }

  const landX = tweened(0, {
    duration: movementDuration,
    easing: cubicOut
  });

  const cloudsX = tweened(0, {
    duration: movementDuration,
    easing: cubicOut
  });


  // $: if ($haulerX === 600) {popQuestion = true}

  function dragStopped(e) {
    console.log('neodrag stop function', e)
  }

  function dragStop(e) {
    console.log('stoped at x: ' + e.detail.offsetX + ' y: ' +
      e.detail.offsetY)
    if (e.detail.offsetX > 280 && e.detail.offsetX < 420 &&
    e.detail.offsetY > -290 && e.detail.offsetY < -230
    ) {
      positionB = {x: 350, y: -260}
    } else {
      positionB = {x: 300*viewSvgRatio, y: 0}
    }
  }

</script>

<main>
  <div>
    <h1>Be the Inventor</h1>
  </div>

  <div class="image-panel-fixed"> <!--  just for the html overlay -->

    <div class="svg-container">

      <svg viewBox="0 0 1600 1200" preserveAspectRatio="xMidYMid slice">

        <image width="3500px" href="images/sky-double.jpg"
          transform="translate({$cloudsX} 0)" 
        />
        <!-- {cloudsTransX} , scale(2.8) -->
        <image width="4000px" href="images/landscape-double.png" 
          transform="translate({$landX} 0)" 
        />

        <!-- hauler -->
        <g transform="translate({$haulerX} 400), scale(1.3)">
          <image  href="images/lumber.png"/>
          <!-- width="200px" -->
          <g  transform="translate(220 -120)">
            {#if challengeIndex === -1}
              <image href="images/horses.png"/>
            {:else if challengeIndex === 0}
              <image href="images/horses-kaput.png"/>
            {/if}
          </g>
        </g>
        {#if challengeIndex === -1}

          <g transform="translate(400 600)">
            <image href="images/option-oxen.png" 
              use:draggable={{ 
                defaultPosition: { x: 0, y: 0 }, 
                bounds: {top: 100, left:20, bottom:200, right:100} 
              }} 
              on:neodrag:end={(e) => console.log('dragging stopped', e)}
            />

            <image class="choice-object" href="images/option-steam-tractor.png" 
              use:draggable={{ 
                position: positionB,
                // bounds: choiceObjectBounds,
                onDrag: ({offsetX, offsetY}) => {
                  // jumps when move starts. 
                  // Maybe need ratio related offset for start positio
                  positionB = {x: (offsetX*viewSvgRatio), y: offsetY*viewSvgRatio};
                  // positionB = {x: (offsetX*viewSvgRatio)-((1600-vwidth)*viewSvgRatio), y: offsetY*viewSvgRatio};
                  // positionB = {x: (offsetX*viewSvgRatio)-(offsetX-(offsetX*viewSvgRatio)), y: offsetY*viewSvgRatio};
                  // positionB = {x: offsetX, y: offsetY};
                }
              }}
              on:neodrag:end={dragStop}
            />

            <image href="images/option-trolly.png"  width="250"
              use:draggable={{ position: { x: 800, y: 0} }}
              on:neodrag:end={dragStopped}
              />
          </g>
        {/if}
      </svg>
    </div> <!-- svg container -->

    <div class="text-box">
      <p>
        <!-- stillHauling: {stillHauling} -->
        {#if challengeIndex > -1}
        {challenges[challengeIndex].question}
        {:else}
        -- vwidth: {vwidth}
        {/if}
      </p>
      <button on:click={handleHauler}>
        start
      </button>
    </div>
  </div> <!-- image panel fixed -->

</main>

<style>

  /* make the image shorter for MOBILE: displays smaller than 800px */
  /* fixed container to keep image from scrolling */
  @media screen and (max-width: 799px) {
    /* .image-panel div.image-panel-fixed {
      Removing image-panel so it will also apply to moment-title  */
    .image-panel-fixed {
      height: 60vh;
      width: 100%;
      position: fixed;
    }
  }

    /* make the image full height for DESKTOP: displays larger than 800px */
  /* fixed container to keep image from scrolling */
  @media screen and (min-width: 800px) {
    /* .image-panel div.image-panel-fixed {
      Removing image-panel so it will also apply to moment-title  */
    .image-panel-fixed {
      height: calc(100vh - 125px);
      width: 100%;
      position: fixed;
    }

    .text-box {
      top: 60%;
      background-color: white;
      position: absolute
    }

    .svg-container {
      /* background-color: red; */
      width: 100%;
      height: 100%;
      position: absolute;
    }
  }

</style>
