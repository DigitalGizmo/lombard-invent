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
      <h4>Funding for "Be The Inventor" Development</h4>
      <ul>
        <li>Bill and Joan Alfond Foundation</li>
        <li>Maine State Museum</li>
      </ul>
      <h4>Development Team</h4>
      <ul>
        <li>Terry Harper - Primary Author; Historian and Curator, Maine Forest & Logging Museum</li>
        <li>Angela Goebel-Bain - Curator of Decorative Arts and History, Maine State Museum</li>
        <li>Juliet Jacobson - Design Director, Digital Gizmo</li>
        <li>Don Button - Technical Director, Digital Gizmo</li>
      </ul>
      <h4>Content Advisors</h4>
      <ul>
        <li>Herb Crosby - Professor Emeritus of Mechanical Engineering Technology at University of Maine, Board of Directors, Maine Forest &amp; Logging Museum</li>
        <li>Joanna Torow - Chief Educator, Maine State Museum</li>
        <li>David Hunt - Lead Educator, Maine State Museum</li>
        <li>Jessica Couture - Board of Directors Outreach Coordinator, Waterville Historical Society</li>
        <li>Jay Violette – Board of Directors Executive Committee, Waterville Historical Society </li>
      </ul>
      <h4>Editorial Team</h4>
      <ul>
        <li>Bernard Fishman - Director, Maine State Museum</li>
        <li>Sheila McDonald - Deputy Director, Maine State Museum</li>
        <li>David Hunt - Lead Educator, Maine State Museum</li>
        <li>Kate Webber - Lead Educator, Maine State Museum</li>
      </ul>

    </div><!-- /modal-wrapper -->
  </div> <!-- /#modal-container /.modal-basic --> <!-- /#modal-container /.modal-basic -->
</div>