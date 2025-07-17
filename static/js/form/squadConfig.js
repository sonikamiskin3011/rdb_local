function testEmail(){
  document.getElementById('iter_manager_notes_id').value = "";
  document.getElementById('prod_owner_notes_id').value = "";
  document.getElementById('squad_lead_notes_id').value = "";
  loadIterManager($("input[name='iter_manager_email']").val());
  loadProdOwner($("input[name='prod_owner_email']").val());
  loadSquadLead($("input[name='squad_lead_email']").val());
}

function loadIterManager(notesEmail){
  $.getJSON("/_loadEPAPI/", {
      email:notesEmail
  }).done(data => {
      if(typeof(data.payload.notesemail) != "undefined"){
        $("input[name='iter_manager_notes_id']").val(data.payload.cn);
      } else {
        document.getElementById('iter_manager_notes_id').value = "None";
    }
  })
}

function loadProdOwner(notesEmail){
  $.getJSON("/_loadEPAPI/", {
      email:notesEmail
  }).done(data => {
    if(typeof(data.payload.notesemail) != "undefined"){
      $("input[name='prod_owner_notes_id']").val(data.payload.cn);

    } else {
      document.getElementById('prod_owner_notes_id').value = "None";
    }
  })
}

function loadSquadLead(notesEmail){
  $.getJSON("/_loadEPAPI/", {
      email:notesEmail
  }).done(data => {
    if(typeof(data.payload.notesemail) != "undefined"){
      $("input[name='squad_lead_notes_id']").val(data.payload.cn);
    } else {
      document.getElementById('squad_lead_notes_id').value = "None";
    }
  })
}

function iFrameAccSuppURL() {
  var x = document.getElementById('squad_id').value;
  document.getElementById("iFrameAccSupp").src="/test4/" + x;
};

function checkMandatory() {
  var tower = document.getElementById('tower').value
  var squadGroup = document.getElementById('squad_group').value
  var squadName = document.getElementById('squad_name').value

  if (tower == "" || squadGroup == "" || squadName == "") {
    $('.saveBtn').prop('disabled', true);
  } else {
    $('.saveBtn').prop('disabled', false);
  }

}

function getFromEDAPI(email){
  var sLoad_EMail = email;
  $.getJSON("/_loadEPAPI/", {
      email:sLoad_EMail
  }).done(data => {
      console.log(data);
      return(data.payload.notesemail)
  })

}
