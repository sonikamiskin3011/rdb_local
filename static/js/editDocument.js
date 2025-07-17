
   $.getJSON(
    "/_editDocument/",
    {
      action: "GET columns"
    })
    .done(data => {
       $("div[id='disPlay']").hide();
       if(data.payload !== undefined){
        setData(data.payload);
        window.oModel = data.payload;
       }else{
        swal({
            title: 'Server not responding!',
            icon: "error",
            buttons: {
              cancel: false,
              confirm: "Close"
            }
          })
       }

    });


function setData(oInputData) {

    // Create Options --> Document Type
    var oDocTypes = getPropertyName(oInputData);
        for(var i = 0; i < oDocTypes.length; i++){
            createOptionInSelect_WithoutAttribute("doc-type", oDocTypes[i]);
        }
}


function getPropertyName(oObject) {
    return Object.keys(oObject);
};

function createOptionInSelect_WithoutAttribute(sSelectID, sText) {

    var DomRefSelect = document.getElementById(sSelectID);
    var option = document.createElement("option");
        option.text = sText;
        DomRefSelect.add(option);
}

function createOptionInSelect_WithAttribute(sSelectID, sText, attrIndex)
{
    var DomRefSelect = document.getElementById(sSelectID);
    var option = document.createElement("option");
    option.text = sText;
    option.setAttribute("index", attrIndex);
    DomRefSelect.add(option);
}

function clearSelectToDefaultStatus(DomRefSelect) {
    var len = DomRefSelect[0].options.length-1;
    for(var i = len; i > 0 ; i--){
        DomRefSelect[0].options[i].remove();
    }
};


function renderLiTag(LI_ID, sName, nIndex)
{
    var liString =  $("<li>").append(sName).addClass("target").attr({"value":sName, "index":nIndex});
    // ----------- put in Not sorted field ---------------

    $(LI_ID).append(liString);

    liString.click(function(event){
        var state = true;
        var sTargetValue = $(this).attr("value");

        for(var i = 0; i < $(".chosen").length; i++)
		{
            if($(".chosen")[0].getAttribute("value") === sTargetValue && $(".chosen")[0].getAttribute("index") !== $(this).attr("index"))
			{
                swal({
                    title:"Name Duplication!",
                    text:"Already selected column with the same name!",
                    icon:"warning",
                    buttons:{cancel:false, confirm:"Close"}
                  })
                  state = false;
                  break;
            }
        }

        if(state === true)
		{
            if(!$(this).is(".chosen"))
			{
				// add Select list
                $("div[id='disPlay']").show();
				$.getJSON("/_editDocument/", {
					action:"GET values",
					table:sTargetValue.substring(0, sTargetValue.indexOf("."))=="DOC"?"DOCUMENT":"SUBDOCUMENT",
					name:sTargetValue.substring(sTargetValue.indexOf(".") + 1)
				}).done(data => {
					$("div[id='disPlay']").hide();
					createAndFillSelectList(sTargetValue, data.payload);
                });
            }
			else
			{
				// remove select
                $("#select-" + sTargetValue).remove();
                $("#show-name-" + sTargetValue).remove();
            }
            $(this).toggleClass("chosen");
        }
    });
};

function createAndFillSelectList(sSelectName, oValues)
{
    $("#chose-value-in-select").append("<label id='show-name-" + sSelectName + "'>" + sSelectName + "</label>");
    var DomRefSelect = document.createElement("SELECT");
    DomRefSelect.setAttribute("id", "select-" + sSelectName);
    DomRefSelect.setAttribute("class", "select-position");
    $("#chose-value-in-select").append(DomRefSelect);

    for(var i = 0; i < oValues.length; i++)
	{
        var option = document.createElement("option");
        option.setAttribute("value", oValues[i][0]);
        var sTextNode = document.createTextNode(oValues[i][0]);
        option.appendChild(sTextNode);
       $("#select-" + sSelectName.replace(".", "\\.")).append(option);
    }
}

function getOldNameAndValue()
{
    aOld = [];
    for(var i = 0; i < $(".chosen").length; i++)
	{
        var sThisValue = $(".chosen")[i].getAttribute("value");
        aOld.push([sThisValue, $("#select-" + sThisValue.replace(".", "\\.")).val()]);
    }
    return aOld;
}

function getNewNameAndValue()
{
    aNew = [];
    input_val = $("#new-value-input").val()
    if(input_val == "''"){
        aNew.push([$("#column-name").val() , ''])
    } else {
        aNew.push([$("#column-name").val() , $("#new-value-input").val()])
    }

    return aNew;
}

function checkAfterSave(aOld)
{
	if($("#doc-type").val().search("--") !== -1 )
	{
        swal({
            text:"Document type not chosen!",
            icon:"warning",
            buttons:{cancel:false, confirm:"Close"}
        });
        return false;
    }

    if($("#column-name").val().search("--") !== -1 )
	{
        swal({
            text:"Column name not chosen!",
            icon:"warning",
            buttons:{cancel:false, confirm: "Close"}
        });
        return false;
    }

    if($("#new-value-input").val() === "" )
	{
        swal({
            text:"New value not inputted!",
            icon:"warning",
            buttons:{cancel:false, confirm:"Close"}
        });
        return false;
    }

    if(aOld.length === 0)
	{
        swal({
            text:"Old Column name not chosen!",
            icon:"warning",
            buttons:{cancel:false, confirm:"Close"}
        });
        return false;
    }

    return true;
}

// ============================== EVENTS ==========================

$("#doc-type").change(function(){
    clearSelectToDefaultStatus($("#column-name"));
    $("#chose-column-names").empty();
    $("#right-side-with-select").empty();
    $("#chose-value-in-select").empty();
    if($(this).val() !== "-- select a document type --")
	{
		var nSizeDocument =  window.oModel["document"].length;
        var oDocument = window.oModel["document"];
        for(var i = 0; i < nSizeDocument; i++)
		{
            if($("#doc-type").val() == "document"){createOptionInSelect_WithAttribute("column-name", oDocument[i][0], i);}
            renderLiTag("#chose-column-names", "DOC." + oDocument[i], i)
        }

		nSizeDocument =  window.oModel["subdocument"].length;
        oDocument = window.oModel["subdocument"];
        for(var j = 0; j < nSizeDocument; j++)
		{
            if($("#doc-type").val() == "subdocument"){createOptionInSelect_WithAttribute("column-name", oDocument[j][0], j + i);}
            renderLiTag("#chose-column-names", "SUBDOC." + oDocument[j], j + i)
        }
    }

})

$("#save-changes").click(function(){
	aOld = getOldNameAndValue();
	aNew = getNewNameAndValue();
    state = checkAfterSave(aOld);

    if(state === true)
	{
		$("div[id='disPlay']").show();
		$.getJSON("/_editDocument/", {
			action:"UPDATE",
			table:$("#doc-type").val(),
			old:JSON.stringify(aOld),
			new:JSON.stringify(aNew)
		}).done(data => {
			$("div[id='disPlay']").hide();
			if(data.message !== "Error!")
			{
				swal({
  					text:"New value was replaced successfully!",
					icon:"success",
					buttons:{cancel:false, confirm:"Close"}
				});
           }
		   else
		   {
			   swal({
				   text:"Error!",
				   icon:"error",
				   buttons:{cancel:false, confirm:"Close"}
				});
           }
        });
    }
})

$("#check-changes").click(function(){
	aOld = getOldNameAndValue();
	aNew = getNewNameAndValue();
    state = checkAfterSave(aOld);

    if(state === true)
	{
		$("div[id='disPlay']").show();
		$.getJSON("/_editDocument/", {
			action:"CHECK",
			table:$("#doc-type").val(),
			old:JSON.stringify(aOld),
			new:JSON.stringify(aNew)
		}).done(data => {
			$("div[id='disPlay']").hide();
			if(data.message !== "Error!")
			{
				swal({


          title: data.payload[0][0] + " records will be updated!",
          text: "Are you sure you want to proceed?",
          icon: "warning",
          buttons: true,
          dangerMode: true,
        })
        .then((willDelete) => {
          if (willDelete) {
            jQuery('#save-changes').click();
          }

        });
           }
		   else
		   {
			   swal({
				   text:"CHECKING FAILED",
				   icon:"error",
				   buttons:{cancel:false, confirm:"Close"}
				});
           }
        });
    }
})
