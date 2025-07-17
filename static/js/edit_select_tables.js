$( document ).ready(function() {


    $('#squad_data_table').DataTable();
    //run at the start
    oTables = [];
    $("tbody[table-name]").each(function(index, oTableDomRef){
        var sTableName = $(oTableDomRef).attr("table-name");
        oTables.push(new CustomTable(sTableName, oTableDomRef));
    });

    $('input[name="changing-input-hidden"]').hide();
    $('a[nr="0"]').attr("aria-selected","true").addClass("active");
    $('div[nr="0"]').addClass("active show");

    $(".nav-link").on("click", function(event){
           var oActiveInformation = getActiveTable(this.getAttribute("aria-controls"))
            if(oActiveInformation){
                document.getElementById("input-" + this.getAttribute("aria-controls")).value = "";
                oActiveInformation[1].empty()
                CustomTable.prototype.pageFunctionality(oActiveInformation[0], oActiveInformation[1][0]);
            }
        })

        // Disable Enter key in Form
        $("form").bind("keypress", function(e) {
            if (e.keyCode == 13) {
                return false;
            }
        });
        $("input[name='page-nr']").keyup(function(event){
            if(event.keyCode === 13){
                pageProcedure(getPageValue($(this).closest("div").attr("table-name")), $($(this).closest("div")).attr("table-name"));
            }
        })
        function pageProcedure(page, sName) {
            var oActiveInformation = getActiveTable(sName)

            var searchVal = document.getElementById("input-" + sName).value;
            if (searchVal.length > 0){
              var found = oActiveInformation[0].filter((record) => JSON.stringify(record).toLowerCase().indexOf(searchVal.toLowerCase()) !== -1);
              CustomTable.prototype.pageFunctionality(found, oActiveInformation[1][0], page);
            } else {
              CustomTable.prototype.pageFunctionality(oActiveInformation[0], oActiveInformation[1][0], page);
            }
        }
        // angle buttons
        $("button[name='start']").click('click', function() {
            // console.log("go to first page")
            pageProcedure(1, $($(this).closest("div")).attr("table-name"));
        })
        $("button[name='back']").click('click', function() {
            // console.log("go to back page")
            pageProcedure(getPageValue($(this).closest("span").attr("table-name"))-1, $($(this).closest("div")).attr("table-name"));
        })
        $("button[name='forward']").click('click', function() {
            // console.log("go to forward page")
            pageProcedure(getPageValue($(this).closest("span").attr("table-name"))+1, $($(this).closest("div")).attr("table-name"));
        })
        $("button[name='end']").click('click', function() {
            // console.log("go to last page")
            var oTableName = getActiveTable($($(this).closest("div")).attr("table-name"));
            pageProcedure(CustomTable.prototype.getNumberOfPage(oTableName[0].length), $($(this).closest("div")).attr("table-name"));
        })

        function getPageValue(sName) {
            for(var i = 0; i < $("input[name='page-nr']").length; i++){
                if (sName === $($("input[name='page-nr']")[i]).closest("div").attr("table-name")){
                    if (parseInt($($("input[name='page-nr']")[i]).val()) < 1){
                        alert("Not exist this page")
                        break;
                    }else{
                        return  parseInt($($("input[name='page-nr']")[i]).val());
                    }
                }
            }
        }

        function getActiveTable(sName) {
            DomRefActiveTable = $("tbody[table-name='"+sName+"']");

            for(var i = 0; i < oTables.length; i++){
                if (oTables[i].sTableName === sName){
                   return [oTables[i].oData, DomRefActiveTable];
                }
            }
        }

        //CODE FOR SEARCH//
        $("button[name='search']").click('click', function() {
            pageProcedureSearch(1, $(this).attr('value'));
        })

        function pageProcedureSearch(page, sName) {
            var oActiveInformation = getActiveTable(sName);
            var searchVal = document.getElementById("input-" + sName).value;
            /*var filteredData = oActiveInformation[0].filter(name => name.includes(searchVal));*/
            var found = oActiveInformation[0].filter((record) => JSON.stringify(record).toLowerCase().indexOf(searchVal.toLowerCase()) !== -1);

            if (searchVal.length > 0){
              CustomTable.prototype.pageFunctionality(found, oActiveInformation[1][0], page);
            } else {
              CustomTable.prototype.pageFunctionality(oActiveInformation[0], oActiveInformation[1][0], page);
            }

        }
        //END OF SEARCH//


        //CODE FOR SORT//
        $("th[name='sort']").click('click', function() {
            var sortStyle = $(this).attr('sortstyle');
            var sortID = $(this).attr('id');
            pageProcedureSort(1, $(this).attr('table'), $(this).attr('col-index'), sortStyle);

            var elms = document.getElementsByClassName('sort')
            for (var i = 0; i < elms.length; i++) {
             elms[i].setAttribute("sortstyle", "none");
            }

            var sortElem = document.getElementById(sortID);
            if (sortStyle !== 'asc') {
              sortElem.setAttribute('sortstyle', 'asc');
            } else {
              sortElem.setAttribute('sortstyle', 'desc');
            }
        })

        function pageProcedureSort(page, sName, col, sortStyle) {
            var oActiveInformation = getActiveTable(sName);
            var searchVal = document.getElementById("input-" + sName).value;
            var found = oActiveInformation[0].filter((record) => JSON.stringify(record).toLowerCase().indexOf(searchVal.toLowerCase()) !== -1);

            if (sortStyle !== 'asc') {
              oActiveInformation[0].sort(function(a, b) {
                	if(isNaN(a[col]) || isNaN(b[col])){
                  	var a1= a[col].toString().toLowerCase(), b1= b[col].toString().toLowerCase();
                    if(a1== b1) return 0;
                    return a1> b1? 1: -1;
                  } else {
                 	 return a[col] - b[col];
                  }
              });
          } else {
            oActiveInformation[0].sort(function(a, b) {
                if(isNaN(a[col]) || isNaN(b[col])){
                  var a1= a[col].toString().toLowerCase(), b1= b[col].toString().toLowerCase();
                  if(a1== b1) return 0;
                  return a1< b1? 1: -1;
                } else {
                 return b[col] - a[col];
                }
            });
          }

            if (searchVal.length > 0){
              CustomTable.prototype.pageFunctionality(found, oActiveInformation[1][0], page);
            } else {
              CustomTable.prototype.pageFunctionality(oActiveInformation[0], oActiveInformation[1][0], page);
            }

        }
        //END OF SORT//

});
