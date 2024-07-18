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



  const cloudsX = tweened(0, {
    duration: movementDuration,
    easing: cubicOut
  });
  
  const landX = tweened(0, {
    duration: movementDuration,
    easing: cubicOut
  });

  const haulerX = tweened(5, {
    duration: movementDuration,
    easing: cubicOut
  });

  let stillHauling = false;

  // movement
  async function handleHauler() {
    stillHauling = true;
    // $haulerX += 300;
    landX.update((landX) => landX - 15);
    cloudsX.update((cloudsX) => cloudsX - 8);
    await haulerX.update((haulerX) => haulerX + 10);
    stillHauling = false;
    challengeIndex +=1;
  }

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
      debug: {$haulerX}
    </p>

    <!-- dragable controlled position overrides normal block layout
    i.e. absolute is not required for objects to overlapp -->
    <!-- <div>
      <img 
        class="draggableImage"
        src="images/option-oxen.png" alt="test non svg"
        use:draggable={{defaultPosition: { x: 180, y: 0 }}} 
        on:neodrag:end={(e) => console.log('dragging stopped', e)}
        />
        <img  src="images/lumber.png"  alt="lumber"/>
    </div> -->

  </div>

  <div class="image-panel"> <!-- like image-panel -->
    <div class="image-panel-fixed">
      <div class="image-panel-image">
        <div class="not-svg">

          <!-- Clouds and landscape -->
          <img  src="images/sky-double.jpg"  alt="sky" class="overlaying-image"
            width="200%" style="transform:translate({$cloudsX}vw, 0px)"
          />
          <img  src="images/landscape-double.png" alt="land" class="overlaying-image"
            width="200%" style="transform:translate({$landX}vw, 0px)"
          />

          <!-- hauler -->
          <div style="transform:translate({$haulerX}vw, 20vh)">
            <img  src="images/lumber.png" class="overlaying-image"
              width="15%" alt="lumber"/> 

            <div  style="transform:translate(15vw, -5vh)">
              {#if challengeIndex === -1}
                <img src="images/horses.png" width="15%" alt="horses"/>
              {:else if challengeIndex === 0}
                <img src="images/horses-kaput.png" width="15%" alt="kaput"/>
              {/if}
            </div>
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
  .overlaying-image {
    position: absolute;
  }
  .draggableImage{
    width: 20%;
    -webkit-user-drag: none;
  }
  .not-svg {
    width: 100%;
  }
  /* .moment-image { */
    /* width: 100%;
    height: 100%; */
    /* width: 3000px;
  } */

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
	/* no inner div version */
	.image-panel-image { /* displays smaller than 800px */
		height: 60vh;
		width: 100%;
 		position: absolute;
	}
	/* the size has to be declared this third time! */
	/* .image-panel-image svg { */
	/* .image-panel-image div {
		height: 60vh;
		width: 100%;
	}
	.image-panel-image img {
		width: 100%;
		height: 60vh;
		object-fit: cover;    
	}	 */
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
	/* no inner div version */
	.image-panel-image {
		width: 100%;
		height: calc(100vh - 125px); 
		position: absolute;
	}
	/* the size has to be declared this third time! */
	/* .image-panel-image svg { */
	/* .image-panel-image div {
		width: 100%;
		height: calc(100vh - 125px);    
	}	 */
	/* .image-panel-image img {
		width: 100%;
		height: calc(100vh - 125px);
		object-fit: cover;    
	}	 */
}

</style>
