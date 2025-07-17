function save(){
  $("#results li").remove();

  var items = []
  $('#sortable2 li').each(function (index, value) {
    let item = {};
    item.value = $(value).data('value');
    items.push(item);
  });

  $.each(items, function (index, value) {
    $("#results").append('<li>' + Object.values(value)+ '</li>');
  });
}

function moveAll(src, dest){
  $(src).children().appendTo(dest);
}

function moveRightAll(){
  moveAll('#sortable1', '#sortable2');
}

function moveLeftAll(){
  moveAll('#sortable2', '#sortable1');
}

// this function selects an item
function select(item){
  $(item).toggleClass('selected');
}

function moveRight(){
  selected = document.getElementsByClassName('selected');
  if($(selected).parent().attr('id') == 'sortable1'){
    $(selected).detach().appendTo('#sortable2');
  }
  $(selected).removeClass('selected');
}

function moveLeft(){
  selected = document.getElementsByClassName('selected');
  if($(selected).parent().attr('id') == 'sortable2'){
    $(selected).detach().appendTo('#sortable1');
  }
  $(selected).removeClass('selected');
}

function searchFunction1() {
    var input, value;
    input = document.getElementById("myInput1");
    value = input.value.toLowerCase().trim();
    $("#sortable1 *").show().filter(function(){
      return $(this).text().toLowerCase().trim().indexOf(value) == -1;
    }).hide();
}

function searchFunction2() {
    var input, value;
    input = document.getElementById("myInput2");
    value = input.value.toLowerCase().trim();
    $("#sortable2 *").show().filter(function(){
      return $(this).text().toLowerCase().trim().indexOf(value) == -1;
    }).hide();
}

// this function clears the content of the input field upon clicking the 'X' button
function reset(field){
  var listId;
  listId = $(field).attr('id')
  if (listId == "button1"){
    $('#myInput1').val(null);
    $("#sortable1 *").show();
  } else {
    $('#myInput2').val(null);
    $("#sortable2 *").show();
  }
}

function save_text(){
  $('#results_text').val(null);
  var listItems = $("#results li");
  for (let li of listItems) {
      let product = $(li);
      $('#results_text').val($('#results_text').val()+product[0].innerHTML+'\n');
  }
  $('#results_text').val($('#results_text').val().slice(0,-1))
}

function clearAcctSupported(){
  $("#results").empty();
  $('#results_text').val("");
}

function suppAcctConfirmed(){
  $("#accounts_supported_val").val('1');
  $("#accounts_supported").html('Accounts Supported Updated');
  $("#accounts_supported").removeClass("btn-primary");
  $("#accounts_supported").addClass("btn-info");
}

function showNewValues(){
  var newValuesDiv = document.getElementById("squadValues");
  var newValuesLabel = document.getElementById("squadValuesLabel");
  var btnConfirm = document.getElementById("btnConfirm");
  var btnSave = document.getElementById("btnMassSave");
  newValuesDiv.style.display = "block";
  newValuesLabel.style.display = "block";
  btnConfirm.style.display = "none";
  btnSave.style.display = "block";
}

function confirmFilter(){
  var tower = document.getElementById("towerFilter").value;
  if (tower == ""){
    $('#btnConfirm').prop("disabled", true);
    $('#btnMassSave').prop("disabled", true);
  } else {
    $('#btnConfirm').prop("disabled", false);
    $('#btnMassSave').prop("disabled", false);
  }
}

function loadConfirmIFrame() {
  var tower = document.getElementById("towerFilter").value;
  var subDom = document.getElementById("subdomainFilter").value;

  if (subDom == ""){subDom = "None";}

  var iFrameURL = "/confirmSquadMassUpdate/" + tower + "/" + subDom

  document.getElementById("ifrConfirm").src=iFrameURL;
}
