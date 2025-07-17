function selectContract() {
var x = $("input[name='legalcontractno']:checked").closest('tr').find('td:eq(2)');
var sendToA = x[0].innerText;
//var sendToA = $("input[name='legalcontractno']:checked").val();
var y = $("input[name='legalcontractno']:checked").closest('tr').find('td:eq(3)');
var sendToB = y[0].innerText;
//window.top.parentA = string(sendToA);
//window.top.parentB = string(sendToB);
parent.myFunc2(sendToA,sendToB);
};

function copyContract(x,y) {
document.getElementById('cust_name').value = x;
document.getElementById('cust_contract').value = y;
};

function iFrameURL() {
var x = document.getElementById('cust_name').value;
document.getElementById("searchContract").src="/editor/new-entry/searchContract/" + x;
document.getElementById("XinputA").value = "";
document.getElementById("XinputB").value = "";
};

function clearAddEntry() {
  $("select[use='modal']").val("");
  $("input[use='modal']").val("");
  $("textarea[use='modal']").val("");
  //checkSubRole();
};

function checkSubRole() {
var x = document.getElementById('changeSubRole').value;
var y = document.getElementById("addedFields");
var y2 = document.getElementById("addedFields2");
var z = document.getElementById('changeRole').value;
var a = document.getElementById('org-select').value;
if ((x == "Finance Contract Analysis" || x == "Contract Commercial Manager" || x == "Contract Management Advisor" || x == "Contract Management Specialist" || x == "Financial Analysis" || (z == "Finance Contract Controlling" && x == "Finance Analyst"))) {
    y.style.display = "block";
	//&& a == "Q2C Services" document.getElementById('cust_name').value = "";
    //document.getElementById('cust_contract').value = "";
    //document.getElementById('comments').value = "";
    if ((x == "Finance Contract Analysis" || x == "Contract Commercial Manager" || x == "Contract Management Advisor" || x == "Contract Management Specialist" || x == "Financial Analysis")) {
      // && a == "Q2C Services" y2.style.display = "block";
      if( !(document.getElementById('nonsom').value) ) {
          document.getElementById('nonsom').value = 0;
        }

    }
    else {
      y2.style.display = "none";
    }
  } else {
    y.style.display = "none";
    //document.getElementById('cust_name').value = "-";
    //document.getElementById('cust_contract').value = "-";
    //document.getElementById('comments').value = "-";
    y2.style.display = "none";
  }
};

function clearSubRole() {
var x = document.getElementById('changeSubRole').value;
var y = document.getElementById("addedFields");
var y2 = document.getElementById("addedFields2");
var z = document.getElementById('changeRole').value;
var a = document.getElementById('org-select').value;
if ((x == "Finance Contract Analysis" || x == "Contract Commercial Manager" || x == "Contract Management Advisor" || x == "Contract Management Specialist" || x == "Financial Analysis" || (z == "Finance Contract Controlling" && x == "Finance Analyst"))) {
	//&& a == "Q2C Services"						
    document.getElementById('cust_name').value = "";
    document.getElementById('cust_contract').value = "";
    document.getElementById('comments').value = "";
    document.getElementById('nonsom').value = 0;
  } else {
    document.getElementById('cust_name').value = "-";
    document.getElementById('cust_contract').value = "-";
    document.getElementById('comments').value = "-";
    document.getElementById('nonsom').value = 0;
  }
};

function saveSubRole() {
  var x = document.getElementById('changeSubRole').value;
  var y = document.getElementById("addedFields");
  var y2 = document.getElementById("addedFields2");
  var z = document.getElementById('changeRole').value;
  var a = document.getElementById('org-select').value;
  var tower = document.getElementById("tower-select").value;
  //Removing Q2C Org's Role & Subrole Combo from condition 
  // && a == "Q2C Services"
  if ((x == "Finance Contract Analysis" || x == "Contract Commercial Manager" || x == "Contract Management Advisor" || x == "Contract Management Specialist" || x == "Financial Analysis" || (z == "Finance Contract Controlling" && x == "Finance Analyst"))){
    if (document.getElementById('cust_name').value == "") {
        document.getElementById('cust_name').value = "-";
    }
    if (document.getElementById('cust_contract').value == "") {
        document.getElementById('cust_contract').value = "-";
    }
    if (document.getElementById('comments').value == "") {
        document.getElementById('comments').value = "-";
    }
    if (document.getElementById('nonsom').value == "") {
        document.getElementById('nonsom').value = "0";
    }
  }
  else {
    document.getElementById('cust_name').value = "-";
    document.getElementById('cust_contract').value = "-";
    document.getElementById('comments').value = "-";
    document.getElementById('nonsom').value = "0";
  }
  if (tower != "Asset Management") {
    document.getElementById('service_line').value = "-";
    document.getElementById('service_category').value = "-";
  }
  // tower == "Enterprise Asset Management" && 
  if (document.getElementById('approval_evidence').value == "") {
    document.getElementById('approval_evidence').value = "-";
  }

  if (a != "Procurement") {
    document.getElementById('primary_category').value = "None";
    document.getElementById('secondary_category').value = "None";
    document.getElementById('client').value = "-";
  } else {
    if (document.getElementById('primary_category').value == "") {
      document.getElementById('primary_category').value = "None";
    }
    if (document.getElementById('secondary_category').value == "") {
      document.getElementById('secondary_category').value = "None";
    }
    if (document.getElementById('client').value == "") {
      document.getElementById('client').value = "-";
    }
  }

};

function emptyComment() {
  var x = document.getElementById('comments').value;
  if (x == "") {
    document.getElementById('comments').value = "-";
  }
};

function checkTower() {
  var x = document.getElementById("tower-select").value;
  var y = document.getElementById("addedFields3");
  var z = document.getElementById("eam-section");
  if (x == "Asset Management") {
    y.style.display = "block";
    z.style.display = "block";
    $('#details_table th:nth-child(14)').show();
    $('#details_table th:nth-child(15)').show();
    $('#details_table td:nth-child(14)').show();
    $('#details_table td:nth-child(15)').show();
    //squadRelationship();
    //copyInitialSquadRelationship();
  } else {
    y.style.display = "none";
    z.style.display = "none";
    $('#details_table th:nth-child(14)').hide();
    $('#details_table th:nth-child(15)').hide();
    $('#details_table td:nth-child(14)').hide();
    $('#details_table td:nth-child(15)').hide();
  }
}

function checkOrg() {
  var x = document.getElementById("org-select").value;
  var y = document.getElementById("addedFields4");

  // if (x == "Q2C Service" || x == "Q2C Services") {
  //   $('#details_table th:nth-child(10)').show();
  //   $('#details_table th:nth-child(11)').show();
  //   $('#details_table th:nth-child(12)').show();
  //   $('#details_table th:nth-child(13)').hide();

  //   $('#details_table td:nth-child(10)').show();
  //   $('#details_table td:nth-child(11)').show();
  //   $('#details_table td:nth-child(12)').show();
  //   $('#details_table td:nth-child(13)').hide();
  // } else {
    $('#details_table th:nth-child(10)').hide();
    $('#details_table th:nth-child(11)').hide();
    $('#details_table th:nth-child(12)').hide();
    $('#details_table th:nth-child(13)').hide();

    $('#details_table td:nth-child(10)').hide();
    $('#details_table td:nth-child(11)').hide();
    $('#details_table td:nth-child(12)').hide();
    $('#details_table td:nth-child(13)').hide();
// }

  if (x == "Procurement") {
    $('#details_table th:nth-child(16)').show();
    $('#details_table th:nth-child(17)').show();
    $('#details_table th:nth-child(18)').show();

    $('#details_table td:nth-child(16)').show();
    $('#details_table td:nth-child(17)').show();
    $('#details_table td:nth-child(18)').show();

    y.style.display = "block";

  } else {
    $('#details_table th:nth-child(16)').hide();
    $('#details_table th:nth-child(17)').hide();
    $('#details_table th:nth-child(18)').hide();

    $('#details_table td:nth-child(16)').hide();
    $('#details_table td:nth-child(17)').hide();
    $('#details_table td:nth-child(18)').hide();

    y.style.display = "none";
  }

  squadNameDD();
  unitRelationship();
  subunitRelationship();
}

function hideDetailCols() {
  $('#details_table th:nth-child(10)').hide();
  $('#details_table th:nth-child(11)').hide();
  $('#details_table th:nth-child(12)').hide();
  $('#details_table th:nth-child(13)').hide();
  $('#details_table th:nth-child(14)').hide();
  $('#details_table th:nth-child(15)').hide();
  $('#details_table td:nth-child(10)').hide();
  $('#details_table td:nth-child(11)').hide();
  $('#details_table td:nth-child(12)').hide();
  $('#details_table td:nth-child(13)').hide();
  $('#details_table td:nth-child(14)').hide();
  $('#details_table td:nth-child(15)').hide();
}

function checkClientDriven() {
  var x = document.getElementById('is_client_driven').value;
  if (x == 1) {
    $('#accounts_supported').prop("disabled", false);
  }
  else if (x == 0) {
    $('#accounts_supported').prop("disabled", true);
  }
}

function repopulateNewFields() {
  var ar = document.getElementById('accelerate_role').value;
  $("select[name = accelerate_role]").empty();
  if (ar == "Doer"){
    $("select[name = accelerate_role]").append("<option value='Doer' selected>Doer</option>");
    $("select[name = accelerate_role]").append("<option value='Enabler'>Enabler</option>");
    $("select[name = accelerate_role]").append("<option value='Both'>Both</option>");
  } else if (ar == "Enabler"){
    $("select[name = accelerate_role]").append("<option value='Doer'>Doer</option>");
    $("select[name = accelerate_role]").append("<option value='Enabler' selected>Enabler</option>");
    $("select[name = accelerate_role]").append("<option value='Both'>Both</option>");
  } else if (ar == "Both"){
    $("select[name = accelerate_role]").append("<option value='Doer'>Doer</option>");
    $("select[name = accelerate_role]").append("<option value='Enabler'>Enabler</option>");
    $("select[name = accelerate_role]").append("<option value='Both' selected>Both</option>");
  } else {
    $("select[name = accelerate_role]").append("<option value='None' selected>None</option>");
  }
  repopulateNewFields2();
  serviceSetup();
}

function serviceInit() {
  var x = document.getElementById('service_line').value;
  var y = document.getElementById('service_category').value;
  $('#service_line_dd').val(x).prop('selected', true);
  serviceRelationship();
  $('#service_category_dd').val(y).prop('selected', true);
}

function dateCheck() {
  var x = document.getElementById('start_date').value;
  var y = document.getElementById('conversion_date').value;
  var z = document.getElementById('end_date').value;
  var u = document.getElementById('contract_end_date').value;
  var tower = document.getElementById('tower-select').value;
  if (x == "" || x == "None"){
    if (tower == "Asset Management"){
      document.getElementById('start_date').value = "1900-01-01";
    } else {
      document.getElementById('start_date').value = "1900-01-01";
    }
  }
  if (y == "" || y == "None"){
    document.getElementById('conversion_date').value = "1900-01-01";
  }
  if (z == "" || z == "None"){
    document.getElementById('end_date').value = "1900-01-01";
  }
  if (u == "" || u == "None" || u == "NULL"){
    document.getElementById('contract_end_date').value = "1900-01-01";
  }
}

function dateLoad() {
  var x = document.getElementById('start_date').value;
  var y = document.getElementById('conversion_date').value;
  var z = document.getElementById('end_date').value;
  var u = document.getElementById('contract_end_date').value;
  if (u == "" || u == "None" || u == "NULL"){
    u = "1900-01-01";
  }
  document.getElementById('start_date_dp').value = x.substring(0,10);
  document.getElementById('conversion_date_dp').value = y.substring(0,10);
  document.getElementById('end_date_dp').value = z.substring(0,10);
  document.getElementById('contract_end_date_dp').value = u.substring(0,10);
}

function dateCopy() {
  document.getElementById('start_date').value = document.getElementById('start_date_dp').value;
  document.getElementById('conversion_date').value = document.getElementById('conversion_date_dp').value;
  document.getElementById('contract_end_date').value = document.getElementById('contract_end_date_dp').value;
  document.getElementById('end_date').value = document.getElementById('end_date_dp').value;

  dateCheck();
}

function statusCheck() {
  var stat = document.getElementById('status').value;
  // var blockDiv = document.getElementById('endDateDiv');
  var endDateLabel = document.getElementById('endDateLabel');
  var endDate = document.getElementsByClassName('endDate')[0];
  if (stat == "Left Kyndryl" || stat == "Left Organization" || stat == "LOA"){
    // blockDiv.style.display = "block";
    endDateLabel.style.display = "";
    endDate.style.display = "";
    document.getElementById('end_date_dp').valueAsDate = new Date();
  } else {
    // blockDiv.style.display = "none";
    endDateLabel.style.display = 'none';
    endDate.style.display = 'none';
    document.getElementById('end_date_dp').value = "1900-01-01";
  }

  dateCopy();
}

function statusCheckInit() {
  var stat = document.getElementById('status').value;
  // var blockDiv = document.getElementById('endDateDiv');
  var endDateLabel = document.getElementById('endDateLabel');
  var endDate = document.getElementsByClassName('endDate')[0];
  if (stat == "Left Kyndryl" || stat == "Left Organization" || stat == "LOA"){
    // blockDiv.style.display = "block";
    endDateLabel.style.display = '';
    endDate.style.display = '';
  } else {
    // blockDiv.style.display = "none";
    endDateLabel.style.display = 'none';
    endDate.style.display = 'none';
  }
}

function statusCheckAdd() {
  var stat = document.getElementById('status').value;
  // var blockDiv = document.getElementById('endDateDiv');
  var endDateLabel = document.getElementById('endDateLabel');
  var endDate = document.getElementsByClassName('endDate')[0];
  if (stat == "Left Kyndryl" || stat == "Left Organization" || stat == "LOA"){
    // blockDiv.style.display = "block";
    endDateLabel.style.display = '';
    endDate.style.display = '';
    document.getElementById('end_date').valueAsDate = new Date();
  } else {
    // blockDiv.style.display = "none";
    endDateLabel.style.display = 'none';
    endDate.style.display = 'none';
    document.getElementById('end_date').value = "";
  }
}

function squadToDDInit(){
  var sGroup = document.getElementById('squad_group').value;
  var sName = document.getElementById('squad_name').value;
  var sGroupDD = "";
  var sNameDD = "";

  sGroupDD = "<option value='" + sGroup + "'>" + sGroup + "</option>";
  sNameDD = "<option value='" + sName + "'>" + sName + "</option>";

  //$("#subdomain_dd").html("");
  $("#squad_group_dd").html(sGroupDD);
  $("#squad_name_dd").html(sNameDD);
}

function copyJobPosition(){
  document.getElementById('job_position').value = document.getElementById('job_position_dd').value;
}

function copyJobPositionInit(){
  document.getElementById('job_position_dd').value = document.getElementById('job_position').value;
}

function hideElements(){
  $('.hide-element').hide();
}

document.onreadystatechange = function() {
  if (document.readyState == "complete"){
    var x = "YES";
    $("#disPlay2").hide();
    var y = "YES";
  }
};

