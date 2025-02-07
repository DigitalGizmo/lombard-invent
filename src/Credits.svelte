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

      <h3>Credits</h3>
      <p>Angela, Juliet, Don and Terry</p>

    </div><!-- /modal-wrapper -->
  </div> <!-- /#modal-container /.modal-basic --> <!-- /#modal-container /.modal-basic -->
</div>