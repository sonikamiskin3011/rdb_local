function loadNewManagers(){

  var repEmail = document.getElementById("rep_email").value;
  if (repEmail != ""){
    loadThirdManager(repEmail);
  }
}

function loadThirdManager(emailAddress){

    var sLoad_EMail =  emailAddress

    $.getJSON("/_EngageSupport/", {
        email:sLoad_EMail
    }).done(data => {
        console.log(data);
    })


    $.getJSON('/_map/', {
        message:"bp",
    }).done(function(data){
        if(data.message == "Success"){
            var url = "https://w3-services1.w3-969.ibm.com/myw3/unified-profile/v1/docs/instances/masterByEmail?email="
            $.get(url + sLoad_EMail).done(function(data2){
                //var notesID = data2['content']['identity_info']['notesEmail'];
                var email = data2['content']['identity_info']['functionalManager']['preferredIdentity'];
                $("input[name='rep_2_email']").val(email)
                loadFourthManager(email);
            })
        }
    })

}

function loadFourthManager(emailAddress){

    var sLoad_EMail =  emailAddress

    $.getJSON("/_EngageSupport/", {
        email:sLoad_EMail
    }).done(data => {
        console.log(data);
    })


    $.getJSON('/_map/', {
        message:"bp",
    }).done(function(data){
        if(data.message == "Success"){
            var url = "https://w3-services1.w3-969.ibm.com/myw3/unified-profile/v1/docs/instances/masterByEmail?email="
            $.get(url + sLoad_EMail).done(function(data2){
                var notesID = data2['content']['identity_info']['notesEmail'];
                $("input[name='rep_2_notes_id']").val(notesID)
                var name = data2['content']['identity_info']['nameDisplay'];
                $("input[name='rep_2_name']").val(name)

                var email = data2['content']['identity_info']['functionalManager']['preferredIdentity'];
                $("input[name='rep_3_email']").val(email)

                loadFifthManager(email);
            })
        }
    })

}

function loadFifthManager(emailAddress){

    var sLoad_EMail =  emailAddress

    $.getJSON("/_EngageSupport/", {
        email:sLoad_EMail
    }).done(data => {
        console.log(data);
    })


    $.getJSON('/_map/', {
        message:"bp",
    }).done(function(data){
        if(data.message == "Success"){
            var url = "https://w3-services1.w3-969.ibm.com/myw3/unified-profile/v1/docs/instances/masterByEmail?email="
            $.get(url + sLoad_EMail).done(function(data2){
                var notesID = data2['content']['identity_info']['notesEmail'];
                $("input[name='rep_3_notes_id']").val(notesID)
                var name = data2['content']['identity_info']['nameDisplay'];
                $("input[name='rep_3_name']").val(name)
            })
        }
    })

}
