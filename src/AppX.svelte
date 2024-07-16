<script>
  import { tweened } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';
  import { draggable } from '@neodrag/svelte';

  import challenges from './lib/challenges.json';

  let frameHeight = 900;
  let popQuestion = false;
  
  let challengeIndex = -1;
  // let question = challenges[0].question;
  const movementDuration = 6000;

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
    await haulerX.update((haulerX) => haulerX + 200);
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
      positionB = {x: 550, y: 0}
    }
  }

  let choiceObjectBounds = {top: 100, left:20, bottom:200, right:100};
  // let choiceObjectBounds = ".image-panel-image";
  let positionB = { x: 500, y: 0};

</script>

<main>
  <div>
    <h1>Be the Inventor</h1>

    <button on:click={handleHauler}>
      start
    </button>
    <p>
      <!-- stillHauling: {stillHauling} -->
      {#if challengeIndex > -1}
        {challenges[challengeIndex].question}
      {:else}
        --
      {/if}
    </p>

    <div>
      <img 
        class="draggableImage"
        src="images/option-oxen.png" alt="test non svg"
        use:draggable={{defaultPosition: { x: 180, y: 0 }}} 
        on:neodrag:end={(e) => console.log('dragging stopped', e)}
        />

        <img  src="images/lumber.png"  alt="lumber"/>
    </div>

  </div>

  <div class="image-panel"> <!-- like image-panel -->
    <div class="image-panel-fixed">
      <div class="image-panel-image">
        <div class="not-svg">
          <!-- <svg viewBox="0 0 2000 1286" preserveAspectRatio="xMidYMid slice"> -->

          <!-- <img  src="images/sky-double.jpg"  alt="sky" class="moment-image"
            style="transform:translate({$cloudsX} 0)"
          /> -->

          <!-- width="350px" -->
          <!-- {cloudsTransX} , scale(2.8) -->

          <!-- <img  src="images/landscape-double.png" alt="land" class="moment-image"
            style="transform:translate({$landX} 0)"
          /> -->


          <!-- width="400px" -->
          <!-- hauler -->
          <div >
            <!-- style="transform:translate({$haulerX} 0)" -->

            <!-- <img  src="images/lumber.png" width="100px" alt="lumber"/>  -->

            <!-- <div  style="transform:translate(220 -120)">
              {#if challengeIndex === -1}
                <img src="images/horses.png" width="15%" alt="horses"/>
              {:else if challengeIndex === 0}
                <img src="images/horses-kaput.png" width="15%" alt="kaput"/>
              {/if}
            </div> -->
          </div>
          <!-- {#if challengeIndex === 0}
            <div  style="transform:translate(300 600)">
              <img src="images/option-oxen.png" alt="ox"
                use:draggable={{ 
                  defaultPosition: { x: 180, y: 0 }, 
                  bounds: {top: 100, left:20, bottom:200, right:100} 
                }} 
                on:neodrag:end={(e) => console.log('dragging stopped', e)}
              />
              <img class="choice-object" src="images/option-steam-tractor.png" alt="steam"
                use:draggable={{ 
                  position: positionB,
                  bounds: choiceObjectBounds,
                  onDrag: ({offsetX, offsetY}) => {
                    positionB = {x: (offsetX*2)-550, y: offsetY*2};
                  }
                }}
                on:neodrag:end={dragStop}
              />
              <img src="images/option-trolley.png"  width="250" alt="trolly"
                use:draggable={{ position: { x: 800, y: 0} }}
                on:neodrag:end={dragStopped}
                />
            </div> -->
          <!-- {/if} -->
          <!-- </svg> -->
        </div> <!-- new div -->
      </div> <!-- end image panel image -->
    </div> <!-- /image-panel-fixed -->
  </div> <!-- image panel-->

  <!-- on:neodrag:end={dragStopped} -->
  <!-- on:neodrag:end={(e) => positionB = {x: 550, y: 0}} -->

</main>

<style>
  .draggableImage{
    width: 20%;
    -webkit-user-drag: none;
  }
  .not-svg {
    width: 100%;
  }
  .moment-image {
        width: 100%;
        height: 100%;
    }
</style>
