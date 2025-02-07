<script>
  export let isModalShowing;

  function onKeyDown(e) {
    // console.log('got to key down');
    if (e.keyCode === 27) {
      isModalShowing = false;
    }
  }

  function closeModal(e) {
    // console.log('target: ' + e.target.id)
    if (e.target.id === 'modal-overlay') {
      isModalShowing = false;
    }
  }  
</script>

<svelte:window  
  on:click={(e) => { closeModal(e)}}/>
  <!-- on:keydown|preventDefault={onKeyDown} -->
   
<div id="modal-overlay" class="">
	<div id="modal-container" class="modal-basic">
    <div id="modal-wrapper">

      <div class="modal-close">
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <a href="/" on:click={(e) => { e.preventDefault(); isModalShowing = false;}}>
          <span  id="close-button" class="close"></span>
        </a>
      </div><!-- /modal-close -->

      <p>Cretits</p>
      <p>Juliet, Don and Terry Rock!</p>

    </div><!-- /modal-wrapper -->
  </div> <!-- /#modal-container /.modal-basic --> <!-- /#modal-container /.modal-basic -->
</div>

<style>

/* MORE POPS */
#modal-overlay {
  background: url(./assets/overlay.png) repeat;
  cursor: pointer;
  height: 100%;
  left: 0;
  position: fixed;
  top: 0px;
  width: 100%;
  z-index: 99;
}

#modal-wrapper {
	background-color: #525252;
  border: 1px solid grey;
  box-shadow: 5px 5px 10px rgba(0, 0, 0, 0.75);/* this isn't working on map--svg? */
  overflow: auto;
  padding: 1.5em;
  position: relative;
}

/* JavaScript assigns this (or .hidden) to modal container */
@media screen and (max-width: 799px) { /* displays smaller than 800px */
	.modal-basic {
	  display: block;
	  overflow-x: hidden;
	  overflow-y: scroll;
	  position: fixed;/* this positions the modal window relative to viewport, it won't scroll with the page */  
	  z-index: 100;
	  height: 100vh;
	  width: 100vw;
	  top: 100px;
	}
}

@media screen and (min-width: 800px) { /* displays larger than 800px */
	.modal-basic {
	  bottom: 0;
	  display: block;
	  left: 0;
	  margin: auto;
	  overflow-x: hidden;
	  overflow-y: scroll;
	  position: fixed;/* this positions the modal window relative to viewport, it won't scroll with the page */  
	  z-index: 100;
	  right: 0;
	  top: 8vh;
	}
}

.modal-close {
	position: fixed;
	right:20px;
  background-color: rgba(0, 0, 0, 0.15);
  border-radius: 50%;
  height: 20px;
  width: 20px;
}

.close { 
  cursor:pointer;
}

.close:after, .close:before {
  content: "";
  height: 20px;
  width: 20px;
  border-top: 2px solid #c3c0c0;
  position: absolute;
  top: 6px;
  right: -8px;
  rotate: -45deg;
}
      
.close:before {
  right: 6px;
  rotate: 45deg;
}
  
.close:hover {	
  opacity: 0.3;
}

div.more-modal {
	color: white;
  display: grid;
  grid-template-columns: 45% 45%;
  grid-template-rows: auto;
  grid-gap: 2vw;
}

div.more-modal h2 {
	color: #F5B901;
	margin: 0;
}

div.more-modal .more-img {
  grid-column: 1;
}

div.more-modal .more-img img {
  max-width: 100%;
}

div.more-modal .more-img p.caption {
	margin: 0.25em 0;
	color: lightgray;
	font-size: .75em;
}

div.more-modal p.more-text {
  grid-column: 2;
  margin-top: 0;
  line-height: 1.4em;
  font-weight: 200;
}
</style>