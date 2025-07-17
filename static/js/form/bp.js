function get_value_from_dict(given_dict, path, key, prop){
  if(given_dict[path[0]] == null){
    //sometimes manager flag doesn't exist
    if(key == "manager_flag"){
      given_dict = "N";
      $("input[from='bp'][name='" + key + "']").val(String(given_dict));
      return given_dict;
    }
    return "";
  }

  if(path.length > 1){
    var place = path.splice(0, 1);
    given_dict = get_value_from_dict(given_dict[place], path, key, prop);
  }
  else
  {
    given_dict = given_dict[path[0]];
    if(Array.isArray(given_dict)){
      var tmp = given_dict[0];
      given_dict.splice(0, 1);
      given_dict.forEach(function(value, index){
          tmp = tmp + ", " + value;
      });
      given_dict = tmp;
    }
    if(prop == 1){
      given_dict = given_dict.replace(/\w\S*/g, function(txt){
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      });
    }

  //flags are saved as true/false, needed Y/N
  if(key == "manager_flag")
    {
      console.log(given_dict);
      if(given_dict == "true" || given_dict == "Y"){given_dict = "Y";}
      else{given_dict = "N";}
    }
    $("input[from='bp'][name='" + key + "']").val(String(given_dict));
  }

  return String(given_dict);
}



function get_request_additional_values(url, email, path, key, prop, tail){
  if(tail != null){
    var tail_prop = tail[0];
    //tail.splice(0, 1);
  }
  //removes first value of tail for some reason
  $.get(url + email, function(data){
    var res = get_value_from_dict(data, path, key, prop);
    if(tail != null){
      var tail_key = tail[1];
      tail.splice(0, 2);
      get_request_additional_values(url, res, tail,tail_key,tail_prop);
    }

    loadNewManagers();
    return res;
    });
}




function getPropertyName(oObject)
{
    return Object.keys(oObject);
}
//run at the start

// Events
//load
$("button[name='load-bp']").click(function(e){
    loadBluePages();
    checkIfExist();
    hideElements();
});
$("input[name='email-load']").keyup(function(event){
    if(event.keyCode === 13){
        loadBluePages();
        checkIfExist();
        hideElements();
    }
})

function clearOldInformationBP() {
    $("div[id='disPlay']").show();
    for (i in $("[saveid]")) { // clear old Information
        $("[saveid]")[i].value = "";
      }
}

function loadBluePages()
{
    var sLoad_EMail =  $("input[name='email-load']").val();
    if(sLoad_EMail === undefined){sLoad_EMail = $("input[name='email']").val();}

    if($("select[name='organization_s']").val() == 'Q2C Services'){
      $.getJSON("/_EngageSupport/", {
        email:sLoad_EMail
      }).done(data => {
        console.log(data);
        var oName = getPropertyName(data.payload);
        for(var i = 0; i < oName.length; i++){
          //check if available in dropdown
          if ($("#" + oName[i] + "_dd option[value='" + data.payload[oName[i]] + "']").length == 0){
            //if not, add in dropdown
            $("#" + oName[i] + "_dd").append(new Option(data.payload[oName[i]], data.payload[oName[i]]));
          }
          //assign in field
          $("input[name='" + oName[i] + "']").val(data.payload[oName[i]]);
        }
      })
    }

    $.getJSON('/_mapKyndryl/', {
        message:"bp",
        email:sLoad_EMail
    }).done(function(data){
        if(data.message == "Success"){
            var url = "https://bluepages.ibm.com/BpHttpApisv3/slaphapi?ibmperson/(mail="
            var url2 = ").list/byjson"
            $.get(url + sLoad_EMail + url2).done(function(data2){
                var given_dict = data.payload2;
                var map = data.payload;
                $.each(map, function(key, value){
                  //clear previous value
                  $("input[name='" + key + "']").val("");

                  //assign values to keys based on map
                  var prop = value[0];
                  value.splice(0, 1);
                  if (value[0] == 0) {
                    mail_key = map[value[1]];
                    value.splice(0, 2);
                    console.log("value[0] == 0 parameters passed to get_request_additional_values funct: ");
                    console.log(url+", "+mail_key+", "+value+", "+key+", "+prop)
                    map[key] = get_request_additional_values(url, mail_key, value, key, prop);
                  } else if(value[0]==1) {
                    mail_key = map[value[1]];
                    tail = map[value[2]];
                    value.splice(0, 3);
                    console.log("value[0] == 1 parameters passed to get_request_additional_values funct: ");
                    console.log(url+", "+mail_key+", "+value+", "+key+", "+prop+", "+tail);
                    map[key] = get_request_additional_values(url, mail_key, value, key, prop, tail);
                  } else {
                    map[key] = get_value_from_dict(given_dict, value, key, prop);
                  }


                });

                var oDoneEvent = new Event("dataload");
                document.dispatchEvent(oDoneEvent);
                $("div[id='disPlay']").hide();
            }).fail(function(){
                $("div[id='disPlay']").hide();
                swal({
                    title:"Error!",
                    text:"Couldn't connect to bp!",
                    icon:"warning",
                    buttons:{cancel:false, confirm:"Close"}
                  });
      });
        }
  else
  {
            $("div[id='disPlay']").hide();
            swal({
                title:"Error!",
                text:"Error in Loading ED Data!",
                icon:"warning",
                buttons:{cancel:false, confirm:"Close"}
              });
        }
    }).fail(function(){
        $("div[id='disPlay']").hide();
        swal({
            title: "Error!",
            text: "Couldn't load data from the server",
            icon: "warning",
            buttons: {
              cancel: false,
              confirm: "Close"
            }
          });
    });
}

function checkIfExist(){
  var sLoad_EMail =  $("input[name='email-load']").val();
  if(sLoad_EMail === undefined){sLoad_EMail = $("input[name='email']").val();}
  $.getJSON("/_checkIfExist/", {
    email:sLoad_EMail
  }).done(data => {
    console.log(data);
    var countID = data.payload['count'];
    var countTower = data.payload['tower'];
    var confirmed = "";
    if (countID > 0){
      $("div[id='disPlay']").hide();
      swal({
        title: "Warning!",
        text: "A record for this resource is already existing for Tower [" + countTower + "]! \n\nIgnore this message if you are creating a record under different Tower, otherwise locate with the search functionality the existing record and apply updates in that one.",
        icon: "warning"
      })
    }

  })
}
