window.nShowDocuments = 10;
window.chosenDelete = [];
window.aSubDocDelete = [];
let savePromise;

// parse data with getData() after data is received
Documents = function (data) {
  if (data) {
    console.log("Document object created.");
    this.data = data;
    this.map = {};
    this.getData();
  }
};

window.ccc = 0;

// preparing data for table
Documents.prototype.getData = function () {
  var oAll = this.data.map.col_dict;
  var oPropertyName = this.getPropertyName(oAll);
  for (var d = 0; d < oPropertyName.length; d++) { // replace not good group names
    if (oPropertyName[d] === "") {
      oPropertyName[d] = "(blank)";
      oAll["(blank)"] = oAll[""];
      delete oAll[""];
    }
    if (oPropertyName[d] === " ") {
      oPropertyName[d] = "(blank)";
      oAll["(blank)"] = oAll[" "];
      delete oAll[""];
    }
  }

  var oData = [];
  var sColumnNames = this.data.map.col_names;

  for (var i = 0; i < oPropertyName.length; i++) {
    oAll = this.data.map.col_dict;
    var nNameIndex = 0;
    oData.push({
      [sColumnNames[nNameIndex]]: oPropertyName[i],
      children: this.getChildren(oPropertyName[i], oAll, nNameIndex+1),
      Nmbr: "N"
      // FTE: "none"
    });
  }
  for (var i = 0; i < this.data.map.col_names.length; i++) {
    if (this.data.map.col_names[i] === "") this.data.map.col_names[i] = "Nmbr";
    if (this.data.map.col_names[i] === "Nmbr" || this.data.map.col_names[i] === "NMBR") {
      this.countDocs(oData);
      window.NmbrIndex = i;
    }
  }
  window.d = [];
  for (var i = 0; i < this.data.map.col_sum.length; i++) {
    if (this.data.map.col_sum[i] !== window.NmbrIndex) {
      var oStartObjectSize = Object.keys(oData);
      for (var j = 0; j < oStartObjectSize.length; j++) {
        window.d[j] = oStartObjectSize[j];
      }
      window.d[window.d.length] = this.data.map.col_names[this.data.map.col_sum[i]];
      this.countFloatNumber(oData, this.data.map.col_names[this.data.map.col_sum[i]]);
    }
  }

  // add first property of object as key
  let oDataNew = {};
  for (let i = 0; i < oData.length; i++) {
    oDataNew[oData[i][Object.keys(oData[i])[0]]] = oData[i];
  }

  this.map.col_dict = oDataNew;
  this.map.col_group = this.data.map.col_group;
  this.map.col_names = this.data.map.col_names;
  this.map.col_sum = this.data.map.col_sum;
  this.map.view_source = this.data.map.view_source;

  this.map.col_sums = [];
  this.map.col_sum_names = [];
  for (var i = 0; i < this.data.map.col_sum.length; i++) {
    this.map.col_sums.push(
      oData[this.data.map.col_names[this.data.map.col_sum[i]]]
    ); // ------------------------------------------------------------- show total
    this.map.col_sum_names.push(this.data.map.col_names[this.data.map.col_sum[i]]); // show Sum colums name
  }
};

Documents.prototype.getPropertyName = function (oAllin) {
  return Object.keys(oAllin);
};

Documents.prototype.getChildren = function (value, oObjPath, nNameIndex) {
  var oAll = oObjPath[value];
  return this.objectINobject(this.getPropertyName(oAll.children), oAll, nNameIndex);
};

Documents.prototype.objectINobject = function (oPropertyName, oObjPath, nNameIndex) {
  if(oPropertyName[0] === ""){
    oObjPath.children["(blank)"] = oObjPath.children[oPropertyName[0]]
    delete oObjPath.children[""];
    oPropertyName[0] = "(blank)";
  }
  if(oPropertyName[0] === " "){
    oObjPath.children["(blank)"] = oObjPath.children[oPropertyName[0]]
    delete oObjPath.children[" "];
    oPropertyName[0] = "(blank)";
  }
  if (nNameIndex === this.data.map.col_group) {
    return this.moreChildrens(oPropertyName, oObjPath.children, nNameIndex);
  } else if (this.data.map.col_group === 0 && nNameIndex === 1) {
    return this.ungroupData(null, oObjPath, nNameIndex);
  } else {
    var object = {};
    for (var i in oPropertyName) {
      object[oPropertyName[i]] = {
        [this.data.map.col_names[nNameIndex]]: oPropertyName[i],
        children: this.getChildren(oPropertyName[i], oObjPath.children, nNameIndex+1),
        Nmbr: "N",
      };
    }
    return object;
  }
};

Documents.prototype.moreChildrens = function (oPropertyName, oObjPath, nNameIndex) {
  var object = {};
  for (var i in oPropertyName) {
    if(oPropertyName[i] === ""){
      oObjPath.children["(blank)"] = oObjPath.children[oPropertyName[0]]
      delete oObjPath.children[""];
      oPropertyName[i] = "(blank)";
    }
    if(oPropertyName[i] === " "){
      oObjPath.children["(blank)"] = oObjPath.children[oPropertyName[0]]
      delete oObjPath.children[" "];
      oPropertyName[i] = "(blank)";
    }
    object[oPropertyName[i]] = {
      [this.data.map.col_names[nNameIndex]]: oPropertyName[i],
      children: this.ungroupData(oPropertyName[i], oObjPath, nNameIndex+1),
      Nmbr: oObjPath[oPropertyName[i]].children.length
    };
  }
  return object;
};

Documents.prototype.ungroupData = function (value, oObjPath, nNameIndex) {
  var oChildren;
  if (value === null) {
    oAll = oObjPath.children[0];
    oPathChildren = oObjPath.children;
  } else {
    oAll = oObjPath[value].children[0];
    oPathChildren = oObjPath[value].children;
  }
  var oChildren = [];
  for (var u = 0; u < oPathChildren.length; u++) {
    var oUngroup = [];
    for (var i in oAll) {
      var propName = this.data.map.col_names[nNameIndex];
      if (propName === undefined) {
        propName = "id";
      }
      if ((oPathChildren[u][i] === null || oPathChildren[u][i] === "null" || oPathChildren[u][i] === "" ||
        oPathChildren[u][i] === " ") && propName.toUpperCase() !== "NMBR")
        oPathChildren[u][i] = "(blank)";
      oUngroup[i] = { [propName]: oPathChildren[u][i] };
      if (nNameIndex !== "id") {
        nNameIndex++;
      }
    }
    oChildren.push(oUngroup);
    nNameIndex = nNameIndex - oAll.length;
  }
  return oChildren;
};

Documents.prototype.countDocs = function (oRootNode) {
  var gl = 0;
  var oNode = oRootNode.children || oRootNode;
  for (var i in oNode) {
    var num = 0;
    if (oNode[i].Nmbr === "N") {
      gl += this.countDocs(oNode[i]);
    } else {
      var num = oNode[i].Nmbr;
      gl += num;
    }
  }
  oRootNode.Nmbr = gl;
  return gl;
};

window.see = 0;
window.c = 0;

Documents.prototype.countFloatNumber = function (oRootNode, sName) { // universal method
  var gl = 0;
  var oNode = oRootNode.children || oRootNode;
  for (var i in oNode) {
    var num = 0;
    var count = 1;
    if (window.see === -1) {
      window.c++;
      if (window.c === 2) {
        break;
      }
    }

    for (var j in oNode[i]) {
      window.c = 0;
      if (Object.keys(oNode[i]).length === count) {
        window.see++;
        gl += this.countFloatNumber(oNode[i], sName);
      }
      if (oNode[i][j][sName] !== undefined) {
        var num = oNode[i][j][sName];
        if (num === "Unknown") num = 0;
        gl += parseFloat(num);
        break;
      }
      count++;
    }
  }
  oRootNode[sName] = gl.toFixed(2);
  window.see--;
  return gl;
};

// When click (+) render next level group
function renderLevel(oData, aColumnNames, nLevel, sParentName) {
  var sNameCol;
  var oNewDomElement;
  var sGeneratedParentName;
  var $viewTable = $("table[name='View_table']");
  var aCellNodes, oCell, sCellCSS, oTableRow, nColAfterGroup;
  var sInsertAfterKeyAttr = (nLevel > 1) ? "parent-name" : "name";
  var oPlus, oLabel;

  for (sKey in oData) {
    if(sKey !== "parent"){
      sKey = replaceTBody_Forward(sKey);
      oNewDomElement = document.createElement('tbody');
      oNewDomElement.setAttribute("level", nLevel);
      if (!sParentName) {
        // no parent
        oNewDomElement.setAttribute("name", sKey);
        $viewTable.append(oNewDomElement);
        sNameCol = "name='"+sKey+"'";
      } else {
        // has parent
        sGeneratedParentName = sParentName+"---"+sKey;
        oNewDomElement.setAttribute("parent-name", sGeneratedParentName);
        $(oNewDomElement).insertAfter($viewTable.find("tbody["+sInsertAfterKeyAttr+"='"+sParentName+"']"));
        // gets the last one child of tbody parent, should insert every child after it
        if($viewTable.find("tbody["+sInsertAfterKeyAttr+"='"+sParentName+"']").nextAll("[parent-name]").last()[0].length !== 0) {
          $(oNewDomElement).insertAfter($viewTable.find("tbody[parent-name='"+sParentName+"']").last());
        }
        sNameCol = "parent-name='"+sGeneratedParentName+"'";
      }

      sKey = replaceTBody_Back(sKey);
      oData[sKey].oDomRef = oNewDomElement;
      aCellNodes = []
      aColumnNames.forEach(function(sColumnName, index) {
        oPlus = document.createElement("i");
        oPlus.setAttribute("class", "fas fa-plus blue click");
        oCell = document.createElement("td");

        if (oData[sKey][sColumnName]) {
          oLabel = document.createElement("span");
          oLabel.textContent = oData[sKey][sColumnName];
          if (nLevel === index) {
            oLabel.setAttribute("style", "color:white; font-weight:bold; font-family:HelveticaNeue-Light, Helvetica Neue Light, Helvetica Neue, Helvetica, Arial, Lucida Grande, sans-serif; letter-spacing:1px; cursor:pointer");
          }
          oLabel.setAttribute("data-type", sColumnName);
          oPlus.append(oLabel)
          oCellValue = (nLevel === index) ? oPlus : oLabel;
          oCell.append(oCellValue);
        }

        sCellCSS = '';
        nColAfterGroup = window.viewMap.col_names.length - window.viewMap.col_group - 1;
        sCellCSS = (index <= window.viewMap.col_group) ? "width:1px;" :  "max-width: calc((100% - 30px) / "+nColAfterGroup+" ); text-align:center;";
        oCell.setAttribute("style", sCellCSS);
        aCellNodes.push(oCell);
      });

      oTableRow = document.createElement("tr");
      aCellNodes.forEach(function (oCellNode) {
        oTableRow.append(oCellNode);
      })

      $viewTable.find("tbody["+sNameCol+"]").append(oTableRow);
    } // if(sKey !== "parent"){
  } // for (sKey in oData) {

  $(".click").unbind();
  $(".click").bind("click", function (e) {
    if (parseInt($(this).closest("tbody")[0].getAttribute("level")) == 0) {
      window.opened_level = "name";
    } else {
      window.opened_level = "parent-name";
    }

    if ($(this).hasClass("fa-plus")) {
      open(this, $(this).closest("tbody")[0]);
    } else {
      close(this, $(this).closest("tbody")[0]);
    }
  });
}

// main table render method
Documents.prototype.renderTable = function (oTable) {
  this.renderTableHead($(".View_table[name='View_table']"));
  $(".View_table thead tr").append("<th style='width: 11%; text-align:center;'>Action</th>");
// calc(100% - 90%)
  renderLevel(this.map.col_dict, this.map.col_names, 0);
  totalTbody(this.map.col_sum, this.map.col_names.length, this.map.col_sums);
  $(".View_table tbody tr").append("<td></td>");
  window.viewMap.col_dict.oDomRef = $("tbody[data-name='Sum_body']")[0];
};

// render head for main table
Documents.prototype.renderTableHead = function (oTable) {
  oTable.append("<thead><tr></tr></thead>");
  $.each(this.map.col_names, (key, value) => {
    let index = key+1;
    oTable.find("tr").append("<th style='text-align: center;'></th>");
    oTable.find("tr th:nth-child("+index+")").html(value.replace("_", " "));
  });
};

// delete function. Deletes from object model,
function deleteAndUpdateNumbers_Anywhere(oData, id, path){   // FTE, Nmbr ....
  Object.keys(oData).forEach(function (element){
    if(oData[element]){
      if(oData[element].constructor === Object){
        if(!path) path = [];
        path.push(oData[element]);
        deleteAndUpdateNumbers_Anywhere(oData[element].children, id, path); // recursive, go to document id
      } else {
        window.oSubtract = {};
        bState = false;
        window.viewMap.col_sum_names.forEach(function(sName){
          window.oSubtract[sName] = 0;
        })
        var aDocuments = oData;
        for(var i = 0; i < aDocuments.length; i++){
          if(aDocuments[i][aDocuments[i].length-1].id === id){ // delete and update
            aDocuments[i].forEach(function(oCell){ // count how many need subtract
              var sPropName = Object.keys(oCell)[0];
              if(window.oSubtract[sPropName] !== undefined){
                if(sPropName.toUpperCase() === "NMBR"){
                  window.oSubtract[sPropName] += 1;
                } else {
                  window.oSubtract[sPropName] += oCell[Object.keys(oCell)];
                  window.oSubtract[sPropName] = parseFloat(window.oSubtract[sPropName].toFixed(2))
                }
              }
              bState = true;
            })
            aDocuments.splice(i, 1);
            i--;
          } // if (... === id)
          if(i === aDocuments.length - 1 && bState === true){ // Update in DomRef Tbody
            path.forEach(function(branch){ // ---------------- Update numbers in Model and HTML
              var DomRefTBODY_DocumentPosition = $(branch.oDomRef);
              for(sName in window.oSubtract){
                // update in HTML
                var nFromTree = parseFloat(branch[sName]);
                var nDifference = nFromTree - parseFloat(window.oSubtract[sName]);
                if(DomRefTBODY_DocumentPosition[0]){
                  DomRefTBODY_DocumentPosition.find("[data-type='"+sName+"']")[0].textContent = (sName.toUpperCase() === "NMBR") ? nDifference : nDifference.toFixed(2);
                }
                // update in model
                branch[sName] -= window.oSubtract[sName];
                branch[sName] = (sName.toUpperCase() === "NMBR") ? nDifference : nDifference.toFixed(2);
              }
            })
            updateAndRerenderTotal();
            bState = false;
            delete window.oSubtract;
          }
        }// for   aDocuments[i]
      }// else
      if(oData.constructor !== Array){
        path.splice(path.length-1, 1);
      }
    } else {
      return;
    }
  })
}

function updateAndRerenderTotal() {   // tBody and Tree - Total
  for(sName in window.oSubtract){
    for(var i = 0; i < window.viewMap.col_sum_names.length; i++){
      if(window.viewMap.col_sum_names[i] === sName){
        window.viewMap.col_sums[i] -= window.oSubtract[sName];
        window.viewMap.col_sums[i] = (sName.toUpperCase() === "NMBR") ? window.viewMap.col_sums[i] : window.viewMap.col_sums[i].toFixed(2);
      }
    }
  }
  $("[data-name='Sum_body']").remove();
  totalTbody(window.viewMap.col_sum, window.viewMap.col_names.length, window.viewMap.col_sums);
}

function updateInTree(oParentTree) {
  for(sName in window.oSubtract){
    Object.keys(oParentTree).forEach(function (sPropName){
      if(oParentTree[sPropName][sName]){
        var nFromTree = parseFloat(oParentTree[sPropName][sName]);
        var nDifference = nFromTree - parseFloat(window.oSubtract[sName]);
        oParentTree[sPropName][sName] -= window.oSubtract[sName];
        oParentTree[sPropName][sName] = (sName.toUpperCase() === "NMBR") ? nDifference : nDifference.toFixed(2);

        var DomRefTBODY_DocumentPosition = $(oParentTree[sPropName].oDomRef);
        if(DomRefTBODY_DocumentPosition[0]){
          DomRefTBODY_DocumentPosition.find("[data-type='"+sName+"']")[0].textContent = (sName.toUpperCase() === "NMBR") ? nDifference : nDifference.toFixed(2);
        }
      }
    })
  }
  if(oParentTree["parent"]){
    updateInTree(oParentTree["parent"])
  }
}

// add sum as last row with specific styling
function totalTbody(cols, size, sums) {
  var $viewTable = $("#main-table");
  var DomRefTbody, oRowElement, oCellElement;
  if ($("tbody[data-name='Sum_body']").length) {
    //sum exists
  } else {
    DomRefTbody = document.createElement("tbody");
    DomRefTbody.setAttribute("data-name", "Sum_body");
    oRowElement = document.createElement("tr");
    DomRefTbody.appendChild(oRowElement);
    $viewTable.append(DomRefTbody);
    for (let i = 0; i <= size; i++) {
      oCellElement = document.createElement("td");
      oCellElement.setAttribute("style", "text-align:center;border-top: 2px solid white;");
      $viewTable.find(DomRefTbody).find(oRowElement).append(oCellElement);
    }
  }

  // add sums from global data object
  for (let col in cols) {
    let index = cols[col]+1;
    $viewTable.find(DomRefTbody).find(oRowElement).css("border", "none");
    $viewTable.find(DomRefTbody).find("tr td:nth-child("+ index+")").html(sums[col]).attr("data-type", window.viewMap.col_sum_names[col]);
  }
}

function getButtonPagesTag(sName, nNow, totalPages) {
  var oRow = document.createElement("tr");
  oRow.setAttribute("class", "documents");
  oRow.setAttribute("tbody-name", sName);
  oRow.setAttribute("style", "border-bottom: 2px solid white;");

  var oCell = document.createElement("td");
  oCell.setAttribute("colspan", "10");
  oCell.setAttribute("style", "text-align: center;");

  var oDiv = document.createElement("div");
  oDiv.setAttribute("style", "margin-top:10px;");

  var oSpan_Left = document.createElement("span");
  oSpan_Left.setAttribute("name", "page-change-left");
  oSpan_Left.setAttribute("tbody-name", sName);
  oSpan_Left.setAttribute("class", "input-group-btn");
  oSpan_Left.setAttribute("style", "display: inline");

  // Button Start / First
  var oBtn_Start = createBtn_Primary_StandartAttributes("start", "", "margin-right: 5px")
  oBtn_Start.classList.add("left");

  var oI_Tag = document.createElement("i");
  oI_Tag.setAttribute("class", "fas fa-angle-double-left");

  oBtn_Start.appendChild(oI_Tag);

  // Button Back
  var oBtn_Back = createBtn_Primary_StandartAttributes("back", "", "")
  oBtn_Back.classList.add("left");

  var oI_Tag = document.createElement("i");
  oI_Tag.setAttribute("class", "fas fa-angle-left");

  oBtn_Back.appendChild(oI_Tag);
// append buttons to Span
  oSpan_Left.appendChild(oBtn_Start);
  oSpan_Left.appendChild(oBtn_Back);

  // input page
  var oInput = document.createElement("input");
  oInput.setAttribute("type", "text");
  oInput.setAttribute("class", "form-control id-name");
  oInput.setAttribute("id-name", sName);
  oInput.setAttribute("value", "1");
  oInput.setAttribute("style", "margin: 0 4px;text-align: center;display: inline;max-width: 8.333333%;");

  var oSpan_Right = document.createElement("span");
  oSpan_Right.setAttribute("name", "page-change-right");
  oSpan_Right.setAttribute("tbody-name", sName);
  oSpan_Right.setAttribute("class", "input-group-btn");

  // Button Forfard
  var oBtn_Forward = createBtn_Primary_StandartAttributes("forward", "", "");
  oBtn_Forward.classList.add("right");

  var oI_Tag = document.createElement("i");
  oI_Tag.setAttribute("class", "fas fa-angle-right");

  oBtn_Forward.appendChild(oI_Tag);

  // Button Last / End
  var oBtn_Last = createBtn_Primary_StandartAttributes("end", "", "margin: 0 4px;");
  oBtn_Last.classList.add("right");

  var oI_Tag = document.createElement("i");
  oI_Tag.setAttribute("class", "fas fa-angle-double-right");

  oBtn_Last.appendChild(oI_Tag);
// append buttons to Span
  oSpan_Right.appendChild(oBtn_Forward);
  oSpan_Right.appendChild(oBtn_Last);

  // Label Display page (Now, All)
  var oLabel = document.createElement("label");
  oLabel.setAttribute("id", "InfoPage"+sName);
  oLabel.setAttribute("style", "display:block");
  oLabel.setAttribute("now", nNow);
  oLabel.setAttribute("end", totalPages);
  oLabel.setAttribute("value", nNow+" of "+totalPages);
  oLabel.innerHTML = nNow+" of "+ totalPages;
// append all to "Global" Tag
  oDiv.appendChild(oSpan_Left);
  oDiv.appendChild(oInput);
  oDiv.appendChild(oSpan_Right);
  oDiv.appendChild(oLabel);

  oCell.appendChild(oDiv);

  oRow.appendChild(oCell);
  return oRow;
}

function renderDocuments(parent, array, empty, sTagPages, totalPages, nNow) {
  // ==================================================== render Documents
  var $viewTable = $("table[name='View_table']");
  var DomRefTbody = "tbody["+window.opened_level+"='"+parent+"']";
  var oRow, oCell;
  for (var i = 0; i < array.length; i++) {
    oRow = document.createElement("tr");
    oRow.setAttribute("class", "documents");
    oRow.setAttribute("index", i);

    $viewTable.find(DomRefTbody).append(oRow);
    for (var j = 0; j < empty; j++) { // empty td for correct table construction
      oCell = document.createElement("td");
      $viewTable.find(DomRefTbody).find(oRow).append(oCell);
    }
    // insert nmbr, fte and name
    for (var j = 0; j < array[i].length - 1; j++) {
      for (let prop in array[i][j]) {
        oCell = document.createElement("td");
        oCell.setAttribute("style", "text-align:center");
        oCell.innerHTML = array[i][j][prop];
        $viewTable.find(DomRefTbody).find(oRow).append(oCell);
      }
    }
    //only super user is able to delete
    oCell = document.createElement("td")
    oCell.setAttribute("class", "buttonCell")
    oCell.setAttribute("style", "display: flex;align-items: center;max-width:1px;")
    $viewTable.find(DomRefTbody).find(oRow).append(oCell);
    if (user === "RDB-RDB-Superuser") { // for [superuser] render checkbox and button delete
      renderDeleteButtons(parent, i);
    } else {  // for [other users] render button clone
      //renderCloneBtn(parent, i);
      var notice = "Removed Clone Function for Non-superuser";
    }
    if (i == array.length - 1) {
      // ============================== if last page not include  number(window.nShowDocuments), then PLUS TR (FOR CONSTANT SIZE)  -------------------- START
      if (array.length < window.nShowDocuments && totalPages == nNow && totalPages != 1) {
        var nPlusTR = window.nShowDocuments - array.length;
        for (var TR = 0; TR < nPlusTR; TR++) {
          // how many tr
          oRow = document.createElement("tr");
          oRow.setAttribute("class", "documents");
          oRow.setAttribute("index", "empty");

          for (var TD = 0; TD < window.viewMap.col_names.length; TD++) {
            oCell = document.createElement("td");
            oCell.setAttribute("style", "height: 34px");
            oRow.appendChild(oCell);
          }
          $viewTable.find(DomRefTbody).append(oRow);
        }
      }
      // ============================== if last page not include  window.nShowDocuments, then PLUS TR (FOR CONSTANT SIZE)  -------------------- END
      $viewTable.find(DomRefTbody).append(sTagPages); // render page functionality
    }
  }

  //add document(child) id for view/delete events
  for (var i = 0; i < array.length; i++) {
    for (var j = 0; j < array[i].length; j++) {
      if (typeof array[i][j] === "object") {
        if (array[i][j].hasOwnProperty("id")) {
          $viewTable.find(DomRefTbody).find("tr[index='"+i+"']").attr("data-key", array[i][j].id);
        }
      }
    }
  }
  checkedChekboxIfExist_onPage();
  function checkedChekboxIfExist_onPage() {
    var DomRefDocuments = $(".documents");
    for(var i = 0; i < DomRefDocuments.length; i++){
      var nIndex = window.chosenDelete.findIndex(function(Chosen_element) {
          if( parseInt(DomRefDocuments[i].getAttribute("data-key")) === Chosen_element){
            DomRefDocuments[i].children[DomRefDocuments[i].children.length-1].children[0].checked = true
          }
      })
    }
  }
  // --------------------------------------- EVENTS START
  // --------------------------------------------------------------------------- Pages Section EVENT START
  $("button[name='forward']").unbind();
  $("button[name='forward']").bind("click", function () {
    var sNameTBody = $(this).closest("span").attr("tbody-name");
    sNameTBody = sNameTBody.split(".").join("\\.");
    var nNow = parseInt($("#InfoPage"+sNameTBody).attr("now"));
    var nEnd = parseInt($("#InfoPage"+sNameTBody).attr("end"));
    sNameTBody = sNameTBody.split("\\.").join(".");
    if (nNow != nEnd) {
      goNextPage(sNameTBody, nNow, nEnd);
      // checked checkboxes if exist on this page
      if(window.chosenDelete !== 0){ checkedChekboxIfExist_onPage(); }
    } else {
      swal({
        title: "Attention!",
        text: "It is the last page!",
        icon: "warning",
        buttons: { cancel: false, confirm: "Close" }
      });
    }
  });

  $("button[name='back']").unbind();
  $("button[name='back']").bind("click", function () {
    var sNameTBody = $(this).closest("span").attr("tbody-name");
    sNameTBody = sNameTBody.split(".").join("\\.");
    var nNow = parseInt($("#InfoPage"+sNameTBody).attr("now"));
    var nEnd = parseInt($("#InfoPage"+sNameTBody).attr("end"));
    sNameTBody = sNameTBody.split("\\.").join(".");
    if (nNow != 1) {
      goBackPage(sNameTBody, nNow, nEnd);
      // checked checkboxes if exist on this page
      if(window.chosenDelete !== 0){ checkedChekboxIfExist_onPage(); }
    } else {
      swal({
        title: "Attention!",
        text: "It is the first page!",
        icon: "warning",
        buttons: { cancel: false, confirm: "Close" }
      });
    }
  });

  $("button[name='start']").unbind();
  $("button[name='start']").bind("click", function () {
    var sNameTBody = $(this).closest("span").attr("tbody-name");
    sNameTBody = sNameTBody.split(".").join("\\.");
    var nNow = parseInt($("#InfoPage"+sNameTBody).attr("now"));
    var nEnd = parseInt($("#InfoPage"+sNameTBody).attr("end"));
    sNameTBody = sNameTBody.split("\\.").join(".");
    if (nNow != 1) {
      var path = getModelPath(sNameTBody);
      $("tbody["+window.opened_level+"='"+sNameTBody+"'] tr[class='documents']").remove();
      var nNowDocumentsShow = 0;
      var nEndDocumentShow = window.nShowDocuments;
      var sTagPages = getButtonPagesTag(sNameTBody, 1, nEnd);
      renderDocuments(sNameTBody, path.slice(nNowDocumentsShow, nEndDocumentShow), window.viewMap.col_group+1,
        sTagPages, nEnd, 1);
      // checked checkboxes if exist on this page
      if(window.chosenDelete !== 0){ checkedChekboxIfExist_onPage(); }
      $("input[id-name='"+sNameTBody+"']").val(1);
    }
  });

  $("button[name='end']").unbind();
  $("button[name='end']").bind("click", function () {
    var sNameTBody = $(this).closest("span").attr("tbody-name");
    sNameTBody = sNameTBody.split(".").join("\\.");
    var nNow = parseInt($("#InfoPage"+sNameTBody).attr("now"));
    var nEnd = parseInt($("#InfoPage"+sNameTBody).attr("end"));
    sNameTBody = sNameTBody.split("\\.").join(".");
    if (nNow != nEnd) {
      var path = getModelPath(sNameTBody);
      $("tbody[" + window.opened_level + "='" + sNameTBody + "'] tr[class='documents']").remove();
      var nNowDocumentsShow = (nEnd - 1) * window.nShowDocuments;
      var nEndDocumentShow = nNowDocumentsShow+window.nShowDocuments;
      var sTagPages = getButtonPagesTag(sNameTBody, nEnd, nEnd);
      renderDocuments(sNameTBody, path.slice(nNowDocumentsShow, nEndDocumentShow), window.viewMap.col_group+1,
        sTagPages, nEnd, nEnd);
      if(window.chosenDelete !== 0){ checkedChekboxIfExist_onPage(); }
      $("input[id-name='"+sNameTBody+"']").val(nEnd);
    }
  });
  $(".id-name").unbind();
  $(".id-name").bind("keypress", function (e) {
    if (!e) e = window.event;
    var keyCode = e.keyCode || e.which;
    if (keyCode == "13") {
      var sNameTBody = $(this).closest("tbody").attr("name") || $(this).closest("tbody").attr(window.opened_level);
      var nInputValue = $(this).val();
      sNameTBody = sNameTBody.split(".").join("\\.");
      var nNow = parseInt($("#InfoPage"+sNameTBody).attr("now"));
      var nEnd = parseInt($("#InfoPage"+sNameTBody).attr("end"));
      sNameTBody = sNameTBody.split("\\.").join(".");
      if (nInputValue <= nEnd && nInputValue >= 1) {
        var path = getModelPath(sNameTBody);
        $("tbody[" + window.opened_level + "='" + sNameTBody + "'] tr[class='documents']").remove();
        var nNowDocumentsShow = (nInputValue - 1) * window.nShowDocuments;
        var nEndDocumentShow = nNowDocumentsShow+window.nShowDocuments;
        var sTagPages = getButtonPagesTag(sNameTBody, nInputValue, nEnd);
        renderDocuments(sNameTBody, path.slice(nNowDocumentsShow, nEndDocumentShow), window.viewMap.col_group+1,
          sTagPages, nEnd, nInputValue);
        // checked checkboxes if exist on this page
        if(window.chosenDelete !== 0){ checkedChekboxIfExist_onPage(); }
        $("input[id-name='"+sNameTBody+"']").val(nInputValue);
      } else {
        swal({
          title: "Attention!",
          text: "Not exist this page!",
          icon: "warning",
          buttons: { cancel: false, confirm: "Close" }
        });
      }
      return false;
    }
  });

  // --------------------------------------------------------------------------- Pages Section EVENT END
  // --------------------------------------------------------------------------- Document openning
  $(".documents td:not(:last-child)").unbind();
  $(".documents td:not(:last-child)").bind("dblclick", event => {
    // find delete button and get its key value
    openDocumentProcedure(event);
  });

  // ------------------------------------------------------------------------------ Document DELETE START
  $(".childButton").bind("click", e => {
    window.chosenDelete.push(parseInt($(e.currentTarget).closest("tr")[0].getAttribute("data-key")))
    deleteDocumentsProcedure([$("[data-key='"+window.chosenDelete[0]+"']").closest("tbody").attr(window.opened_level)], "btn");
  });

  // ------------------------------------------------------------------------------ Document DELETE CHECKBOX
  $(".chose-delete").unbind(); // ============================== BIND model
  $(".chose-delete").bind("click", function () {
    checkboxProcedure(this);
  });

  // ------------------------------------------------------------------------------ Document DELETE END
  $(".cloneDoc").unbind();
  $(".cloneDoc").bind("click", function() {
    cloneDoc(this);
  })
  // --------------------------------------- EVENTS END
  if(window.chosenDelete.length === 0){
    $.each($(".childButton") ,function(index, del_btn){
      del_btn.disabled = false;
    })
  } else {
    $.each($(".childButton") ,function(index, del_btn){
      del_btn.disabled = true;
    })
  }
} // =============================================================== function renderDocuments  ---- END

function goNextPage(sNameTBody, nNow, nEnd) {
  var path = getModelPath(sNameTBody);
  $("tbody[" + window.opened_level + "='" + sNameTBody + "'] tr[class='documents']").remove();
  var nNowDocumentsShow = nNow * window.nShowDocuments;
  var nEndDocumentShow = nNowDocumentsShow+window.nShowDocuments;
  var sTagPages = getButtonPagesTag(sNameTBody, nNow+1, nEnd);
  renderDocuments(sNameTBody, path.slice(nNowDocumentsShow, nEndDocumentShow), window.viewMap.col_group+1,
    sTagPages, nEnd, nNow+1);
  $("input[id-name='"+sNameTBody+"']").val(nNow+1);
}

function goBackPage(sNameTBody, nNow, nEnd) {
  var path = getModelPath(sNameTBody);
  $("tbody[" + window.opened_level + "='" + sNameTBody + "'] tr[class='documents']").remove();
  var nNowDocumentsShow = (nNow - 2) * window.nShowDocuments;
  var nEndDocumentShow = nNowDocumentsShow+window.nShowDocuments;
  var sTagPages = getButtonPagesTag(sNameTBody, nNow - 1, nEnd);
  renderDocuments(sNameTBody, path.slice(nNowDocumentsShow, nEndDocumentShow), window.viewMap.col_group+1,
    sTagPages, nEnd, nNow - 1);
  $("input[id-name='"+sNameTBody+"']").val(nNow - 1);
}

function replaceTBody_Back(sNameTBody) { // jQuery not use this symbols, need to replace them
  while (sNameTBody.search("__") !== -1 || sNameTBody.search("1s-1") !== -1 ||
    sNameTBody.search("11s-1") !== -1 || sNameTBody.search("2s-1") !== -1 || sNameTBody.search("7s-1") !== -1) {
    sNameTBody = sNameTBody.replace("1s-1", "(");
    sNameTBody = sNameTBody.replace("11s-1", ")");
    sNameTBody = sNameTBody.replace("__", " ");
    sNameTBody = sNameTBody.replace("8s-1", "&");
    sNameTBody = sNameTBody.replace('2s-1', '"');
    sNameTBody = sNameTBody.replace('7s-1','/')
  }
  return sNameTBody;
}

function replaceTBody_Forward(sNameTBody) {  // jQuery not use this symbols, need to replace them
  while (sNameTBody.search(" ") !== -1 || sNameTBody.search("&") !== -1 || sNameTBody.search('"') !== -1 ||
   sNameTBody.search('/') !== -1 || sNameTBody.indexOf('(') !== -1 || sNameTBody.indexOf(')') !== -1) {
    sNameTBody = sNameTBody.replace("(", "1s-1");
    sNameTBody = sNameTBody.replace(")", "11s-1");
    sNameTBody = sNameTBody.replace(" ", "__");
    sNameTBody = sNameTBody.replace("&", "8s-1");
    sNameTBody = sNameTBody.replace('"', "2s-1");
    sNameTBody = sNameTBody.replace('/','7s-1')
  }
  return sNameTBody;
}

function getModelPath(sNameTBody) {
  // get array whot need to render
  sNameTBody = replaceTBody_Back(sNameTBody);
  var arr = sNameTBody.split("---");
  path = window.viewMap.col_dict;
  for (var i = 0; i < arr.length; i++) {
    path = path[arr[i]].children;
  }
  return path;
}

function renderDeleteButtons(parent, i) {
  var $viewTable = $("table[name='View_table']");
  var DomRefTbody = "tbody["+window.opened_level+"='"+parent+"']";
  var oInput, oButton;
  oInput = createElementInput(oInput);
  oButton = createElementButton_Del(oButton);
  oButton_Clone = createBtn_Primary_StandartAttributes("clone", "Clone", "padding: 0.120rem .75rem;" );
  oButton_Clone.classList.add("cloneDoc");
  $viewTable.find(DomRefTbody).find("tr[index='"+ i+"'] .buttonCell").append(oInput).append(oButton).append(oButton_Clone);
}

// ============================================================= FUNCTIONS create Element ====== ----- START
function createElementInput(oInput) { // for document [checkbox ]
  oInput = document.createElement("input");
  oInput.setAttribute("type", "checkbox");
  oInput.setAttribute("class", "chose-delete");
  oInput.setAttribute("style", " transform: scale(1.5); align-items:center;");
  return oInput;
}

function createElementButton_Del(oButton) { // for document [btn delete]
  oButton = document.createElement("button");
  oButton.setAttribute("class", "btn btn-danger childButton");
  oButton.setAttribute("style", "margin-left:10px;padding: 0.120rem .75rem;margin-right:10px;");
  oButton.innerHTML = "Delete";
  return oButton;
}
// ============================================================== FUNCTIONS create Element ====== ----- END

function renderCloneBtn(parent, i) {
  var $viewTable = $("table[name='View_table']");
  var DomRefTbody = "tbody["+window.opened_level+"='"+parent+"']";
  var oButton_Clone;
  oButton_Clone = createBtn_Primary_StandartAttributes("clone", "Clone Document", "padding:0.120rem .75rem;");
  oButton_Clone.classList.add("cloneDoc");
  $viewTable.find(DomRefTbody).find("tr[index='"+ i+"'] .buttonCell").append(oButton_Clone);
}

function open(icon, DomRefTBODY) { // expand (+)
  sName = DomRefTBODY.getAttribute("name") || DomRefTBODY.getAttribute("parent-name");
  var path = getModelPath(sName);
  if (path.constructor === Array) {
    var sTagPages = "";
    var totalPages = 1;
    if (path.length > window.nShowDocuments) {
      totalPages = Math.ceil(path.length / window.nShowDocuments);
      var sTagPages = getButtonPagesTag(sName, 1, totalPages);
    }
    renderDocuments(sName, path.slice(0, window.nShowDocuments), window.viewMap.col_group+1, sTagPages,
      totalPages, 1);
  } else {
    renderLevel(path, window.viewMap.col_names, parseInt(DomRefTBODY.getAttribute("level"))+1, sName);
  }
  $(icon).removeClass("fa-plus");
  $(icon).addClass("fa-minus");
}

function close(icon, DomRefTBODY) { // collapse (-)
  sName = DomRefTBODY.getAttribute("name") || DomRefTBODY.getAttribute("parent-name");
  var DomRefDocuments = $(".documents");
  if (window.viewMap.col_group > parseInt(DomRefTBODY.getAttribute("level"))) {
    for (var i = 0; i < $("tbody").length; i++) {
      if (sName === $("tbody")[i].getAttribute("parent-name") || 
        sName === $("tbody")[i].getAttribute("name")) {
        for (var u = i; u < $("tbody").length; u++) {
          if (parseInt($("tbody")[i].getAttribute("level")) < parseInt($("tbody")[u].getAttribute("level"))
            && $("tbody")[u].getAttribute("parent-name").search(sName) === 0) {
            // find tbody who have documents (is checkbox is selected) if find, then delete from global array
            if(window.chosenDelete.length !== 0 ){
              for(var d = 0; d <  DomRefDocuments.length; d++){
                if(DomRefDocuments[d].closest("tbody") === $("tbody")[u]){
                  var nIndex = window.chosenDelete.findIndex(function(element) {
                    return element === parseInt(DomRefDocuments[d].getAttribute("data-key"))
                  })
                  if(nIndex !== -1) {window.chosenDelete.splice(nIndex, 1); }
                }
              }
            }
            $("tbody")[u].remove();
            u--;
          }
        }
        break;
      }
    }
  } else { // look only documents, when collapse closest group of Documents
    var DomRefOnlyDocuments = $("tbody["+window.opened_level+"='"+sName+"'] tr[class='documents']")
    for(var r = 0; r < DomRefOnlyDocuments.length; r++){
      // find Document in documents (is checkbox is selected) if find, then delete from global array
      if(window.chosenDelete.length !== 0 ){
        for(var d = 0; d <  DomRefDocuments.length; d++){
          if(DomRefDocuments[d] === DomRefOnlyDocuments[r] && DomRefOnlyDocuments[r].closest("tbody").getAttribute(window.opened_level) !== DomRefDocuments[d].closest("tbody").getAttribute(window.opened_level)){
            var nIndex = window.chosenDelete.findIndex(function(element) {
              return element === parseInt(DomRefDocuments[d].getAttribute("data-key"))
            })
            if(nIndex !== -1 ) { window.chosenDelete.splice(nIndex, 1); }
          }
        }
      }
    }
    DomRefOnlyDocuments.remove();
  }
  $(icon).removeClass("fa-minus");
  $(icon).addClass("fa-plus");
  var arr = [] ;
  $(".documents input:checked").each(function(index, element){
    for(i in window.chosenDelete){
      if(window.chosenDelete[i] === parseInt($(element).closest("tr").attr("data-key"))){
        var findDublicate = arr.find(function(element){
          return element === window.chosenDelete[i];
        })
        if(!findDublicate) arr.push(window.chosenDelete[i])
      }
    }
  })
  window.chosenDelete = arr;
  // if close all groups // don't touch  $(".documents")
  if($(".fa-minus").length === 0 || window.chosenDelete.length === 0 || $(".documents").length === 0){
    deleteCheckBoxInformation();
  }
}

function addStickyHeadandUpButton(thead) {
  var elemTop = thead.offset().top; // search results position
  $("Button[name='button-top']").hide()
  $(window).scroll(() => {
    var docViewTop = $(this).scrollTop(); //current scroll position
    if(docViewTop > elemTop) {
      $("Button[name='button-top']").fadeIn('fast')
      thead.find("tr").find("th").css({"position":"sticky", "top":"0", "background":"black", "z-index":"100"})
    } else {
      $("Button[name='button-top']").fadeOut('fast')
    }
  })
}

function getView(sName) { // Open view what was chosen
  while (sName.search("%20") !== -1) {
    sName = sName.replace("%20", " ");
  }
  $("#view-name").html("View: "+sName);
  /// here need input view name 
  $.getJSON("/_view/", { view: sName }, () => {
    $("div[id='disPlay']").hide();
  }).done((data, request) => {
    if (data.message !== "Error!") {
      if(!window.selects) {
        let selects = []
        let promises = []
        window.selects = []
        $("select:not(.exempt-select)").each(function (index, value) {
          selects.push(value.name)
        })
        for(let sel in selects) {
          window.selects.push(new Promise((resolve, reject) => {
            $.getJSON('/_tables/', { message: "FORM", payload: selects[sel] }, data => {
            }).fail((jqxhr, textStatus, error) => {
              var err = textStatus+": "+error;
              reject(err)
            }).done(data => {
              if(data.message == "Success") {
                data.db2_data.unshift([0, ""])
                resolve({[selects[sel]] : data})
              }
            })
          }))
        }
      }
      // show and enable buttons, when data is ready
      enableDisableTableControlButtons(false)
      $("#collapseBtn").on("click", () => {
        if ($(".click").hasClass("fa-minus")) {
          $(".click").removeClass("fa-minus");
          $(".click").addClass("fa-plus");
          deleteCheckBoxInformation();
        }
        $("tbody[parent-name]").remove();
        $("tr[class='documents']").remove();
      });
      $("#refreshBtn").on("click", () => {
        location.reload();
      });
      let Doc = new Documents(data);
      console.log(Doc)
      window.viewMap = Doc.map;
      window.viewData = Doc.data;
      Doc.renderTable($(".View_table[name='View_table']"));
      addStickyHeadandUpButton($(".View_table[name='View_table'] thead"))
      $("Button[name='button-top']").bind("click", () => {
        $('html').animate({ scrollTop: 0 }, 'slow'); return true;
      })
      $("tbody[parent-name='']").removeAttr("parent-name");
      $("tbody[parent-name]").hide();
      $("input[name='search_User']").on("focus", event => {
        event.currentTarget.placeholder = "More than 1 symbol!";
      });
      //Events
      const searchResultTable = $(".View_table").clone().addClass("search-results")
        .insertAfter(".View_table").hide().html("");
      const aSearch = Doc.map.col_dict;
      $("input[name='search_User']").on("keyup", event => {
        let nodes = []
        let structure = [];
        var value = $(event.currentTarget).val().toLowerCase();
        searchResultTable.html("");
        $("#collapseBtn").attr("disabled", "true")
        if (value.length > 1) {
          deleteCheckBoxInformation();
          let resultTree = getResult(aSearch, value, [], structure);
          /* slice array to 100 values, might be problems with speed if >100*/
          resultTree = resultTree.slice(0, 100)
          $(".View_table").hide();
          $(".search-results").show();
          $("Button[name=load-more]").show()
          if(resultTree.length == 0) {
            $(".search-results").append("<tbody><tr><td style='font-size: 20px;'>No documents found!</td></tr></tbody>")
          } else {
            $(".search-results").append("<thead><tr></tr></thead>");
            addStickyHeadandUpButton($(".search-results thead"))
            for (let i = 0; i < structure.length - 1; i++) {
              $(".search-results thead tr").append("<th>"+structure[i]+"</th>");
            }
            // render last Column
            $(".search-results thead tr").append("<th style='width: 11%;text-align:center;'>Action</th>");
            for (let i = 0; i < resultTree.length; i++) {
              let id = resultTree[i][resultTree[i].length - 1].id;
              nodes.push("<tbody name='search-"+id+"'><tr class='documents' index='" + i + "' data-key='" +id +"'></tr></tbody>");
            }
            $(".search-results").append(nodes.join(","))
            for (let i = 0; i < resultTree.length; i++) {
              for (let j = 0; j < resultTree[i].length - 1; j++) {
                for (let prop in resultTree[i][j]) {
                  $(".search-results tr[index='"+i+"']").append("<td data-key='"+prop+"' data-highlight>"+resultTree[i][j][prop]+"</td>")
                }
              }
              var oCell = document.createElement('td');
              var oInput, oButton;
              if (user === "RDB-RDB-Superuser") {
                oInput = createElementInput(oInput);
                oButton = createElementButton_Del(oButton);
                var oButton_Clone;
                oButton_Clone = createBtn_Primary_StandartAttributes("clone", "Clone", "padding: 0.120rem .75rem;" );
                oButton_Clone.classList.add("cloneDoc");
                oCell.appendChild(oInput);
                oCell.appendChild(oButton);
                oCell.appendChild(oButton_Clone);
                $(".search-results tr[index='" +i +"']").append(oCell);
                $(".childButton").unbind();
              } else { // all user NOT Superuser
                //oButton = createBtn_Primary_StandartAttributes("clone", "Clone Document", "padding: 0.120rem .75rem;" );
                //oButton.classList.add("cloneDoc");
                oCell.setAttribute("class", "buttonCell");
                oCell.setAttribute("style", "display: flex;align-items: center;max-width:1px;");
                //oCell.appendChild(oButton);
                $(".search-results tr[index='" +i +"']").append(oCell);
              }
              $(".cloneDoc").unbind();  // BIND btn "Clone Document"
              $(".cloneDoc").bind("click", function() {
                cloneDoc(this);
              })
            }
          }
          let replace = value
          let pattern = new RegExp(replace, "gi")
          // change color for pattern in found items
          $("td[data-highlight]").each((i, cell) => {
            let text = $(cell).text()
            let idx = text.search(pattern)
            let sub = text.substr(idx, value.length)
            let newtext = text.replace(pattern, "<span class='highlight'>"+sub +"</span>")
            $(cell).html(newtext)
          })
          // append sticky table head on scroll
        } else {
          $(".search-results").html("");
          deleteCheckBoxInformation();
          // $("Button[name=load-more]").hide()
          $(".View_table").show();
          $("#collapseBtn").attr("disabled", false)
        }
        $(".search-results .documents").bind("dblclick", event => {
          openDocumentProcedure(event);
        });
        $(".childButton").on("click", e => {
          window.chosenDelete.push(parseInt($(e.currentTarget).closest("tr")[0].getAttribute("data-key")))
          deleteDocumentsProcedure([$("[data-key='"+window.chosenDelete[0]+"']").closest("tbody").attr("name")], "btn");
        });
        // ------------------------------------------------------------------ Document DELETE CHECKBOX
        $(".chose-delete").unbind(); // ============================== BIND model
        $(".chose-delete").bind("click", function () {
          checkboxProcedure(this);
        });
      }); // $("input[name='search_User']").on("keyup", event
      // recursive functions that collects matched documents and gets structure for search result table
      function getResult(elem, value, arr, structure) {
        let temparr = [];
        let expression = new RegExp(value, "i");
        for (let i in elem) {
          if (typeof elem[i] == "object") {
            if (elem[i].hasOwnProperty("children")) {
              if (elem[i].children.constructor == Array) {
                temparr = [...elem[i].children];
                for (let i = 0; i < temparr.length; i++) {
                  for (let obj in temparr[i]) {
                    for (let prop in temparr[i][obj]) {
                      if (structure.indexOf(prop) == -1) {
                        structure.push(prop);
                      }
                    }
                    for(let prop in temparr[i][obj]) {
                      if(typeof temparr[i][obj][prop] === 'string') {
                        let key = temparr[i][obj][prop]
                        if (key) {
                          if (key.search(expression) !== -1) {
                            if (arr.indexOf(temparr[i]) == -1) {
                              arr.push(temparr[i]);
                            }
                          }
                        }
                      }
                    }
                  }
                }
              } else {
                getResult(elem[i].children, value, arr, structure);
              }
            }
          }
        }
        return arr;
      }
      $("button[data-dismiss='modal']").click(function (e) {
        if($("[name='edit-mode']").length === 0){ // if Client in Edit mode
          swalAndQuestionExit();
        } else {
          clearFormModal();
        }
        checkTower();
      });
      $(".buttonCell").off("hover");
    } else {
      console.log(data);
      $(".pageCorrection").append("<div class='alert alert-primary' role='alert'>Data not found!</div>");
    }
  }).fail((error, textStatus) => {
    console.log("Request failed: "+textStatus+": "+error);
  });
}

function setViewHistoryOfSaves_view(LOG, lastDate) {
  LOG = LOG.sort(function(a, b){
    if( Date.parse(a.stamp.split("/").reverse().join("-")) > Date.parse(b.stamp.split("/").reverse().join("-")))
      return -1;
    if ( Date.parse(a.stamp.split("/").reverse().join("-")) < Date.parse(b.stamp.split("/").reverse().join("-")))
      return 1;
    return 0;
  })
  // if exist last time
  if(lastDate) {
	  try {
		  for(var g = 0; g < LOG.length; g++){if(LOG[g].stamp === lastDate){break;}}
		  if(typeof LOG[g] == "undefined"){g = LOG.length - 1;}
		  $("#last-save").append("<p>"+LOG[g].stamp+" : "+ LOG[g].user_id+" : <br><div class='fieldTables'>"+splitFieldToArray(LOG[g].fields) +"</div></p>\n");
	  } catch(e) { console.log(e.toString()); }
  }
  $("#HistoryOfSaves").append(function () {
    var sTextTime = "";
    for (var i = 0; i < LOG.length; i++) {
      sTextTime += "<p>"+LOG[i].stamp+" : "+LOG[i].user_id+" : <br><div class='fieldTables'>"+splitFieldToArray(LOG[i].fields)+"</div></p>\n";
    }
    return sTextTime;
  });
}

function enableDisableTableControlButtons(bEnable) {
  if(bEnable) {
    $(":button").hide();
    $(":button").prop("disabled", true);
    $("#searchInput").hide();
    $("#searchInput").prop("disabled", true);
  } else {
    $(":button").show();
    $(":button").prop("disabled", false);
    $("#searchInput").show();
    $("#searchInput").prop("disabled", false);
  }
}

$(document).ready(function () {
  // show buttons when data is ready
  enableDisableTableControlButtons(true)
  $(".load-spinner").show();
  $("div[id='disPlay']").show();
  //Run at the start
  // get view Name if not correct open Unit
  getView(window.location.hash !== "" ? window.location.hash.replace("#", "") : "Unit");
  // elements for RDB-Superuser and RDB-Editors
  Documents.prototype.renderPlusElements = function (sUserType, isArchive) {
    $("div[id='disPlay']").hide();
    // only editor and super user can edit
    if (sUserType === "RDB-RDB-Superuser" || sUserType === "RDB_Editors" ) {
      if (isArchive == 'live') {
        var text ='<div style="padding: 1%;"><button class="btn btn-primary" type="button" value="edit-mode" '
          +'name="edit-mode">Edit Mode</button> </div>';
        document.getElementById("forNew").innerHTML = text;
        $("button[name='edit-mode']").unbind()
        $("button[name='edit-mode']").bind("click", function() {
          checkTower();
          openDocumentModal_EditMode("UPDATE");
          serviceRelationship();
          repopulateNewFields();
        })
        // if super / editor USER
      } else {
        $("div[id='disPlay']").hide();
      }
    }
  };

  // set Document information
  Documents.prototype.loadDataToReadModal = function(oDocument) {
    window.oDocumentContent = oDocument; // this is for ckecking when save changes
    for(i in oDocument) {
      var sPropName = i;
      $("[saveid]").each(function(){
        if(this.getAttribute("name") === sPropName) {
          if(oDocument[sPropName] === null){oDocument[sPropName] = "";}
          this.value = oDocument[sPropName];
          if(this.tagName !== "INPUT") {
            var option = document.createElement("option");
            option.text = oDocument[sPropName];
            option.selected = true;
            $(this).append(option);
          }
        }
        if(sPropName == "contract_end_date")
          document.getElementById(sPropName).value = oDocument[sPropName];
      });
    }
  };

  Documents.prototype.loadTableToReadModal = function (oSubdocument) { // set Sub - Document information
    var aColumnNames = [];
    for (var i = 0; i < $("th[modal-name]").length; i++) {
      aColumnNames.push($($("th[modal-name]")[i]).attr("modal-name"));
    }

    var nTotalFTE = 0;
    for (i in oSubdocument) {
      var j = 1;
      var sLineTR =
        "<tr><td style='width: 2%;' ID='"+oSubdocument[i].id+"' old='true'></td>";
      for (var a = 0; a < $("th[modal-name]").length; a++) {
        for (sPropName in oSubdocument[i]) {
          if ($($("th[modal-name]")[a]).attr("modal-name") === sPropName) {
            if (sPropName === "fte") {
              nTotalFTE += parseFloat(oSubdocument[i][sPropName]);
            }
            if (sPropName === "o2o" || sPropName === "pct" || sPropName === "nonsom") {
              if (oSubdocument[i][sPropName] !== null) {
                oSubdocument[i][sPropName] = parseFloat(oSubdocument[i][sPropName]);
              }
            }
            sLineTR +=
              "<td row-index=" +
              i +
              " col-index='" +
              j +
              "'>" +
              oSubdocument[i][sPropName] +
              "</td>";
            j++;
            break;
          }
        }
      }
      sLineTR += "</tr>";
      $(".readTbody").append(sLineTR);
    }
    $("em[name='calc-fte']").text(
      "Total FTE = "+parseFloat(nTotalFTE.toFixed(2))
    );
    window.totalFTE = parseFloat(nTotalFTE.toFixed(2));
  };

  //save changes
  $("button[model-button='changing']").click(function (e) {
    var table = read_table();
    if ($(this).attr("name") == "add-entry") {
      var row = read_modal();
      table.push(row);
      var state = checkModal(row);
      tableResult(state, table, e);
    } else if ($(this).attr("name") == "modify-entry") {
      var row = read_modal();
      var idWhoChanged = table[$(".data-table input:checked").attr("row-index")][0];
        idWhoChanged = idWhoChanged.slice(0,2); // delete attribute old=true
      table[parseInt($(".data-table input:checked").attr("row-index"), 10)] = row;
      if(parseInt(idWhoChanged[1]) === 0){
        table[$(".data-table input:checked").attr("row-index")].unshift(idWhoChanged);
      }

      table[$(".data-table input:checked").attr("row-index")][0][0] = table[$(".data-table input:checked").attr("row-index")][0][0].toString();
      var state = checkModal(row);
      tableResult(state, table, e);
    }
    // hidden 2 modal
    $("#form-modal").modal("hide");
    $("input:checked").prop("checked", false);

    // checkSubRole();
    categorySetup();
    checkTower();
    checkOrg();

  });

  $("button[name='UnwrapHistory']").click(function (event) {
    if ($(".HistoryField").css("display") === "none") {
      $(".HistoryField").fadeIn();
      $(".last-time").fadeOut();
    } else {
      $(".HistoryField").fadeOut();
      $(".last-time").fadeIn();
    }
  });

  $("input[name='pct']").focusout(function (e) {
    checkLimitPCT($(this));
  });
  $("input[name='o2o']").focusout(function (e) {
      checkLimitO2O($(this));
  });
  $("input[name='nonsom']").focusout(function (e) {
      checkLimitNonSOM($(this));
  });

});

function deleteCheckBoxInformation() {
  window.chosenDelete = [];
  $("#del-selected").remove(); // button
  $("#clone-selected").remove(); // button
  $("#upd-selected").remove();
  $(".chose-delete").each(function()  { // clear all checkboxes
    $(this)[0].checked = false;
  })
  $.each($(".childButton") ,function(index, del_btn){
    del_btn.disabled = false;
  })
}

function deleteDocumentsProcedure(aTbodyNames, sWayFrom) {
  swal({
    title: "Are you sure?",
    text: "Chosen documents will be deleted. OK?",
    icon: "warning",
    buttons: true,
    dangerMode: true,
  }).then((willDelete) => {
    if (willDelete) {
      if(window.chosenDelete.length > 0) {
        Promise.all(window.chosenDelete.map((item,index) => {
          $.getJSON("/_time_form/", {
            action: "DELETE",
            document: item
          })
        })).then(values => {
          swal("All items deleted!", {
            icon: "success",
            buttons: false,
            timer: 1000,
          });
          for (var i = 0; i < window.chosenDelete.length; i++) {
            deleteAndUpdateNumbers_Anywhere(window.viewMap.col_dict, window.chosenDelete[i]);
          }
          if(aTbodyNames[0].search('search') !== 0){ // delete in group, where exist page functionality
            aTbodyNames.forEach(function(sNameTBody){ // set page
              var nNow = parseInt($("[id-name='"+sNameTBody+"']").val()) || 1;
              var nEnd = parseInt($("#InfoPage"+sNameTBody).attr("end")) || 1;
              var path = getModelPath(sNameTBody);
              $("tbody[" + window.opened_level + "='" + sNameTBody + "'] tr[class='documents']").remove();
              var nNowDocumentsShow = (nNow - 1) * window.nShowDocuments;
              var nEndDocumentShow = nNowDocumentsShow+window.nShowDocuments;
              if(nNow !== 1 || nEnd !== 1){
                if(path.slice(nNowDocumentsShow, nEndDocumentShow).length === 0){ // if not documents on this page, then go one page back
                  nNowDocumentsShow -= window.nShowDocuments;
                  nEndDocumentShow -= window.nShowDocuments;
                  nEnd -= 1;
                  nNow -= 1;
                } else if (path.slice(nNowDocumentsShow, nEndDocumentShow).length < window.nShowDocuments){ // if on page less documents than window.nShowDocuments
                  if(nNowDocumentsShow !== 0){
                    nNowDocumentsShow -= window.nShowDocuments;
                    nEndDocumentShow -= window.nShowDocuments;
                  }
                  nEnd -= 1;
                }
              }
              if( nEnd !== 1){ // render page functionality only when total pages more 1
                var sTagPages = getButtonPagesTag(sNameTBody, nNow, nEnd);
              }
              renderDocuments(sNameTBody, path.slice(nNowDocumentsShow, nEndDocumentShow),
                window.viewMap.col_group+1, sTagPages, nEnd, nNow);
              $("input[id-name='"+sNameTBody+"']").val(nNow);
            })
          } else { // delete in serch field
            console.log(aTbodyNames)
            aTbodyNames.forEach(function(sSearch_name){
              $("tbody[name='"+sSearch_name+"']").remove();
            })
          }
          deleteCheckBoxInformation();
        }).catch(reason => {
          console.log("Deleting error: "+reason)
        })
      }
    } else{ // if cancel
      if(sWayFrom === "btn") window.chosenDelete = [];
    }
  });
}

function findWhereDocumentsAre() {
  var arr = [];
  if(!window.opened_level) { window.opened_level = 'name'; }
  $(".documents :checked").each(function(i) {
    var DomElement = $(".documents :checked")[i];
    var nFindID = window.chosenDelete.find(function(ch_elem) {
      return parseInt(DomElement.closest("tr").getAttribute("data-key")) === ch_elem;
    })
    if(!!nFindID){
      var sExist = arr.find(function(element){
        return DomElement.closest("tbody").getAttribute(window.opened_level) === element;
      })
      if(!sExist){
        arr.push(DomElement.closest("tbody").getAttribute(window.opened_level));
      }
    }
  })
    return arr;
}

function openDocumentBackInReadOnlyMode(id) {
  clearFormModal();
  savePromise.then(() => {
    $("div[id='disPlay']").show();
	  $.getJSON("/_time_form/", {
  		action:"GET",
	  	document:id
  	}).done(data => {
	  	console.log(data);
		  if(data.message === "Error!") {
  			swal({
	  		  title:'Error!',
		  	  text:'The server is not responding',
			    icon:"error",
			    buttons:{cancel:false, confirm:"Close"}
  			})
	  	} else {
		    window.nOpenID = id;
		    Documents.prototype.loadDataToReadModal(data.document);
  		  Documents.prototype.loadTableToReadModal(data.subdocument);
	  	  Documents.prototype.renderPlusElements(user, window.viewMap.view_source);
		    setViewHistoryOfSaves_view(data.doc_log, data.document.last_update_stamp); /// see historu LOG
		    $(".modal-background").show();
  		  $("html").css("overflow-y", "hidden");
        //procedures that would run after saving but not closing
        copyInitialSquadRelationship();
        checkTower();
        repopulateNewFields();
        dateLoad();
        statusCheckInit();
        checkOrg();
        towerRelationship();
        squadNameDD();
        subdomRelationship();
        squadRelationship();
        squadToDDInit();
        copyInitialSubdomain();
  		}
	  });
  })
  checkTower();
}

function openDocumentProcedure(event) {
  disablNewDD();
  let id = $(event.currentTarget).closest("tr").attr("data-key");
  id = parseInt(id);
  window.currentId = id
  $("div[id='disPlay']").show();
  $.getJSON("/_time_form/", {
    action: "GET",
    document: id
  }).done(data => {
    // console.log("openDocumentProcedure "+JSON.stringify(data));
    if(data.message === "Error!"){
      swal({
        title: 'Error!',
        text: 'The server is not responding',
        icon: "error",
        buttons: { cancel: false, confirm: "Close" }
      })
    } else {
      window.totaldbFTE = parseFloat(data.document.total_fte)
      window.nOpenID = id;
      Documents.prototype.loadDataToReadModal(data.document);
      Documents.prototype.loadTableToReadModal(data.subdocument);
      window.oOpenSubdodument = data.subdocument;
      Documents.prototype.renderPlusElements(user, window.viewMap.view_source);
      setViewHistoryOfSaves_view(data.doc_log, data.document.last_update_stamp); /// see historu LOG
      $(".modal-background").show();
      $("html").css("overflow-y", "hidden");
      $("[saveid]").attr("readonly", true);
      $('#start_date_dp').attr("readonly", true);
      $('#conversion_date_dp').attr("readonly", true);
      $('#end_date_dp').attr("readonly", true);
      $('#contract_end_date_dp').attr("readonly", true);
    }
    copyInitialSquadRelationship();
    checkTower();
    repopulateNewFields();
    dateLoad();
    statusCheckInit();
    checkOrg();
    towerRelationship();
    squadNameDD();
    subdomRelationship();
    squadRelationship();
    squadToDDInit();
    copyInitialSubdomain();
    hideElements();
  });
}

function checkboxProcedure(thisCheckbox) {
  let nData_key = parseInt($(thisCheckbox).closest("tr").attr("data-key"));
  var delBtn = document.createElement("button");
  delBtn.setAttribute("class", "btn btn-danger");
  delBtn.setAttribute("id", "del-selected");
  delBtn.setAttribute("style", "margin-right:5px");
  delBtn.innerHTML = "Delete Selected";
  var BtnUpdateBP = document.createElement("button");
  BtnUpdateBP.setAttribute("class", "btn btn-info");
  BtnUpdateBP.setAttribute("id", "upd-selected");
  BtnUpdateBP.setAttribute("style", "margin-right:5px");
  BtnUpdateBP.innerHTML = "Documents side BluePages update";
  if (window.chosenDelete.length === 0) {
    $("#btn-function").append(delBtn);
    $("#btn-function").append(BtnUpdateBP);
  }
  var DomRefDocumentTR = $("[data-key]");
  if ($(thisCheckbox).is(":checked")) {
    $.each($(".childButton") ,function(index, del_btn){
      del_btn.disabled = true;
    })
    for(var i = 0; i < DomRefDocumentTR.length; i++){ // select with equal ID
      if(parseInt(DomRefDocumentTR[i].getAttribute("data-key")) === parseInt(nData_key)
        && $(thisCheckbox).closest("tr")[0] !== DomRefDocumentTR[i]){
        DomRefDocumentTR[i].cells[DomRefDocumentTR[i].cells.length-1].children[0].checked = true;
      }
    }
    var nDelLength = window.chosenDelete.length;
    var state = true;
    for(var i = 0; i < nDelLength; i++){
      if(window.chosenDelete[i] === parseInt(nData_key)){
        state = false;
        $(thisCheckbox).prop('checked', false);
        swal({
          title: "Error!",
          text: "This document was already  chosen",
          icon: "warning",
          buttons: { cancel: false, confirm: "Close" }
        });
        break;
      }
    }
    if(state === true){
      window.chosenDelete.push(nData_key);
    }
  } else {
    for(var i = 0; i < DomRefDocumentTR.length; i++){ // unselect with equal ID
      if(parseInt(DomRefDocumentTR[i].getAttribute("data-key")) === parseInt(nData_key)
        && $(thisCheckbox).closest("tr")[0] !== DomRefDocumentTR[i]){
        DomRefDocumentTR[i].cells[DomRefDocumentTR[i].cells.length-1].children[0].checked = false;
      }
    }
    var index = window.chosenDelete.indexOf(nData_key);
    if (index > -1) {
      window.chosenDelete.splice(index, 1);
    }
  }
  if (window.chosenDelete.length === 0) {
    $("#del-selected").remove();
    $("#upd-selected").remove();
    $.each($(".childButton") ,function(index, del_btn){
      del_btn.disabled = false;
    })
  }
  // DELETE EVENT FOR MAIN TABLE
  $("#del-selected").unbind();
  $("#del-selected").bind("click", function () {
    deleteDocumentsProcedure(findWhereDocumentsAre(), "checkbox");
  });
  $("#upd-selected").unbind();
  $("#upd-selected").bind("click", function () {
    updateBluePagesData(window.chosenDelete);
  });
}

// get id and go to cloneProcedure()
function cloneDoc(thisBtn) {
  window.chosenClone = [];
  var nId = parseInt(thisBtn.closest("tr").getAttribute("data-key"));
  window.chosenClone.push(nId);
  cloneProcedure();
}

// Open Document in clone Mode
function cloneProcedure() {
	if(window.chosenClone.length === 1) {
    let sClone = window.chosenClone[0];
    $("div[id='disPlay']").show();
    $.getJSON("/_time_form/", {
      action:"GET",
      document:sClone
    }).done(data => {
      // console.log(data);
      /* do something with collected data*/
      if(data.message === "Error!") {
        swal({
          title:'Error!',
          text:'The server is not responding',
          icon:"error",
          buttons:{cancel:false, confirm:"Close"}
        })
        $("div[id='disPlay']").hide();
      } else {
  			window.totaldbFTE = parseFloat(data.document.total_fte);
	  		Documents.prototype.loadDataToReadModal(data.document);
		  	Documents.prototype.loadTableToReadModal(data.subdocument);
			  Documents.prototype.renderPlusElements(user, window.viewMap.view_source);
  			openDocumentModal_EditMode("INSERT");
        $(".modal-background").show();
  			$("html").css("overflow-y", "hidden");
        //Initial Checks after cloning
        copyInitialSquadRelationship();
        checkTower();
        repopulateNewFields();
        dateLoad();
        statusCheckInit();
        checkOrg();
        towerRelationship();
        squadNameDD();
        subdomRelationship();
        squadRelationship();
        squadToDDInit();
        copyInitialSubdomain();
  		}
    });
  } else {
    swal({
      title:'Warning!',
      text:'Cloning not possible! Only 1 document can be cloned at time!',
      icon:"warning",
      buttons:{cancel:false, confirm:"Close"}
    })
  }
}

var decodeEntities = (function(){
  var element = document.createElement("div");
  function decodeHTMLEntities(str) {
    if(str && typeof str === "string") {
      str = str.replace(/<script[^>]*>([\S\s]*?)<\/script>/gmi, "");
      str = str.replace(/<\/?\w(?:[^"'>]|"[^"]*"|'[^']*')*>/gmi, "");
      element.innerHTML = str;
      str = element.textContent;
      element.textContent = "";
    }
    return str;
  }
  return decodeHTMLEntities;
})();

function openDocumentModal_EditMode(sAction) {
  enableNewDD();
	$("div[id='disPlay']").show();
	$("#forNew").empty(); // clear Edit Button
	// ----------------------------------- Procedure to get values of Select  === START
	window.aSelectValues = [];
  var object = {};
  var DomSelect = $("select[saveid]");
  for(var i = 0; i < DomSelect.length; i++){
    object[DomSelect[i].getAttribute("name")] = DomSelect[i].value;
  }
  window.aSelectValues.push(object);
	// ------------------------------------------ Procedure to get values of Select  === END
	$("select[saveid]:not(.exempt-select)").empty();
	// unlock editable fields
	$("[saveid='4']").attr("readonly", false);
	$("[saveid='47']").attr("readonly", false);
	$("[saveid='50']").attr("readonly", false);
  $("[saveid='53']").attr("readonly", false);
  $('#start_date_dp').attr("readonly", false);
  $('#conversion_date_dp').attr("readonly", false);
  $('#end_date_dp').attr("readonly", false);
  $('#contract_end_date_dp').attr("readonly", false);
  
  var oDiv = document.createElement("div");
	oDiv.setAttribute("style", "padding: 1%");
	var oButton_Save = createBtn_Primary_StandartAttributes("save", "Save", "margin-right:5px");
	oButton_Save.setAttribute("value", "save");
	var oButton_SaveClose =createBtn_Primary_StandartAttributes("save_close", "Save and Close", "");
	oButton_SaveClose.setAttribute("value", "save_close");
	oDiv.appendChild(oButton_Save);
	oDiv.appendChild(oButton_SaveClose);
	document.getElementById("forNew").appendChild(oDiv);
	var totalFTE = '<a>Total FTE</a><input id="fteDisplay" name="total-fte" value="'+window.totaldbFTE+'" type="text" size="5"><input id="time_indicator" name="time_indicator" value="" type="text" size="10" readonly>';
	document.getElementById("totalFTE").innerHTML = totalFTE;
  checkTimeIndicator();
  var oBtn_Add = createBtn_Primary_StandartAttributes("add-entry", "Add Entry", "margin-right:5px");
  oBtn_Add.setAttribute("button-name", "add-entry");
  oBtn_Add.setAttribute("data-target", "#form-modal");
  oBtn_Add.setAttribute("data-toggle", "modal");
  oBtn_Add.setAttribute("id", "add"); //checkSubRole();
  oBtn_Add.setAttribute("onclick", "clearAddEntry();checkTower();serviceRelationship();clearCategory();");
  document.getElementById("EditTable").appendChild(oBtn_Add);
  var oBtn_Modify = createBtn_Primary_StandartAttributes("modify-entry", "Modify Entry", "margin-right:5px");
  oBtn_Modify.setAttribute("button-name", "modify-entry");
  oBtn_Modify.setAttribute("data-target", "#form-modal");
  oBtn_Modify.setAttribute("data-toggle", "modal");
  oBtn_Modify.setAttribute("disabled", "disabled");
  oBtn_Modify.setAttribute("id", "form-modal-modify");
  oBtn_Modify.setAttribute("onclick", "checkTower();serviceRelationship();");
  oBtn_Modify.classList.add("wait-radio");
  document.getElementById("EditTable").appendChild(oBtn_Modify);
  var oBtn_Add_Clone = createBtn_Primary_StandartAttributes("modify-entry", "Clone Entry", "margin-right:5px");
  oBtn_Add_Clone.setAttribute("button-name", "add-entry");
  oBtn_Add_Clone.setAttribute("data-target", "#form-modal");
  oBtn_Add_Clone.setAttribute("data-toggle", "modal");
  oBtn_Add_Clone.setAttribute("disabled", "disabled");
  oBtn_Add_Clone.setAttribute("id", "form-modal-clone");
  oBtn_Add_Clone.setAttribute("onclick", "checkTower();serviceRelationship();");
  oBtn_Add_Clone.classList.add("wait-radio");
  document.getElementById("EditTable").appendChild(oBtn_Add_Clone);
  var oBtn_Remove = createBtn_Primary_StandartAttributes("delete-entry", "Remove Selected", "margin-right:5px");
  oBtn_Remove.setAttribute("button-name", "delete-entry");
  oBtn_Remove.setAttribute("data-toggle", "modal");
  oBtn_Remove.setAttribute("disabled", "disabled");
  oBtn_Remove.classList.add("wait-radio");
  document.getElementById("EditTable").appendChild(oBtn_Remove);
  $("#add-btn").append('<button type="button" class="btn btn-info btn-sm" name="load-bp">Load BluePages &amp; EngageSupport</button>');
  $("#form-modal").on("shown.bs.modal", function(){
    var oSubDocs = parseInt($("input:checked").attr("row-index"));
    if($("input:checked").attr("row-index")) {
      var oSubDocuments = getInputTable($(".data-table"), $("[modal-name]"));
      $("#form-modal select").each((i, DomRef) => {
        for(sName in oSubDocuments[oSubDocs]) {
          if(DomRef.name === sName){$(DomRef).val(decodeEntities(oSubDocuments[oSubDocs][sName]))}
        }
      });
    }
    // checkSubRole();
  });
  $(".readTbody tr td:first-child").each((i, value) => {
    $(value).append("<input type='radio' row-index='" + i + "' col-index='" + i + "' name='selected-row'></input>");
  });
  $("input[type='radio']").bind("click", function (e) {
    $(".wait-radio").attr("disabled", false);
  });
  checkFTE();
  $("input[name='total-fte']").change(function (e) {
    checkFTE();
    checkTimeIndicator();
    var totFTE = document.getElementById('fteDisplay');
    if (isNaN(totFTE.value) || totFTE.value <= 0 || totFTE.value > 1) {
      //totFTE.value = "1.00";
    }
  });
  disactivateOrActiveFields(true);
  getSelectValues("view"); // another JS file (Simular function with form)
  // Events
  $("select[child]:not(.noRel-select)").change(function (e) {  // ---- filter select options on change
    setSelectRelationship(this)
  });
  $("#tower-select").change(function (e) {  // ---- filter select options on change
    checkTower();
    checkOrg();
    towerRelationship();
    squadNameDD();
    subdomRelationship();
    squadRelationship();
    copySquadRelationship();
  });
  $("button[name='save']").click(function(event){ //  --- Save btn
    event.preventDefault();
    //check the dates
    dateCheck();
    var state = checkForm();
    var timeIndicator = document.getElementById('time_indicator');
    if (timeIndicator.value == "ERROR") {
      swal({
        title:'Error!',
        text:"Invalid Total FTE",
        icon:'warning',
        buttons:{cancel:false, confirm:"Close"}
      })
    }	else if(state == ""){
      saveOperation(false, "save", sAction);
    } else {
      swal({
        title:'Error!',
        text:state,
        icon:'warning',
        buttons:{cancel:false, confirm:"Close"}
      })
    }
  });
  $("button[name='save_close']").click(function (event) {   // --- Save and Close btn
    //check the dates
    dateCheck();
    var state = checkForm();
    var timeIndicator = document.getElementById('time_indicator');
    if (timeIndicator.value == "ERROR") {
      swal({
        title:'Error!',
        text:"Invalid Total FTE",
        icon:'warning',
        buttons:{cancel:false, confirm:"Close"}
      })
    } else if(state == ""){
      saveOperation(true, "save-close", sAction);
    }	else {
      swal({
        title:'Error!',
        text:state,
        icon:'warning',
        buttons:{cancel:false, confirm:"Close"}
      })
    }
  });
  // Refresh BluPages Data
  $("button[name='load-bp']").click(function(e){
    loadBluePages(); // in bp.js
    squadToDDInit();
    hideElements();
  });
  document.addEventListener("dataload", function () { // catch event when Data from BP was loaded
    swal({
      title: "Successfully!",
      text: "Data successfully loaded!",
      icon: "successfully",
      buttons: { cancel: false, confirm: "Close" }
    });
    checkIfExistClone();
  })
  // After Save Button get All necessary data
  function saveOperation(bAnswerToExit, sWayFrom, sAction) {
    var bState_Save = false;
    var aInputs = $("[SaveID]");
    oSendEmployeeInformation = getInputData(aInputs); // get all Document information
    var DOMReftableData = $(".data-table");
    var oTableName = $("[modal-name]");
    var totalFTE = parseFloat($("#fteDisplay").val());
    var oDataChanged = findDifferenceOfData(oSendEmployeeInformation);
  	// if it is Clone, then not push id Doc (if exist ID)
    if(!!window.nOpenID) {
      oSendDetails = getInputTable_view(DOMReftableData, oTableName);
  	  // if something changed [document OR subdocument]
      if(Object.keys(oDataChanged[0]).length !== 0 || oSendDetails.length !== 0 ||
        window.aSubDocDelete.length !== 0){
        oDataChanged[0]["doc_id"] = window.nOpenID;
        bState_Save = true;
      }
    } else {
      oDataChanged = oSendEmployeeInformation; // if it is clone, then replace changed Data to all Form information
      oSendDetails = getInputTable(DOMReftableData, oTableName); // get all SubDoc
  	  bState_Save = true;
    }
    user_email = user_email.replace('kyndryl.com','ocean.ibm.com')
    var oActiveNotesID = getNoteID(user_email);
    //look for user in Dictionary
    var user;
    var x;
    var userDict = oActiveNotesID.search.entry[0].attribute;
    for (x=0; x < userDict.length - 1; x++){
      if (String(userDict[x].name).toLowerCase() == 'emailaddress'){
        user = userDict[x].value[0];
      }
    }
    if(bState_Save === true) {
       // --- Send to back-End Form
      $("div[id='disPlay']").show();
      if(sAction === "UPDATE") {
        savePromise = new Promise((resolve, reject) => {
          $.getJSON("/_time_form/", {
            action: "UPDATE",
            document: JSON.stringify(oDataChanged),
            subdocument: JSON.stringify(oSendDetails),
            user: user,
            // user: oActiveNotesID,
            subdocument_delete: JSON.stringify(window.aSubDocDelete),
            total_FTE: totalFTE
          }).done(function(data){
            resolve(doneAction(data, bAnswerToExit, sWayFrom));
          });
        })
      } else {
    		// INSERT
        savePromise = new Promise((resolve, reject) => {
          $.getJSON("/_time_form/", {
            action:"INSERT",
            document:JSON.stringify(oDataChanged),
            subdocument:JSON.stringify(oSendDetails),
            user:user,
            total_FTE:totalFTE
          }).done(function(data){
            resolve(doneAction(data, bAnswerToExit, sWayFrom));
          });
        })
		    // INSERT  ========= END
      }
    }	else {
  	  // if nothing is changed
      swal("Nothing is changed, so nothing is saved!", {
        icon: "success",
        buttons: false,
        timer: 2000,
      });
      if(sWayFrom !== "save") clearFormModal();
    }
  }

  function doneAction(data, bAnswerToExit,sWayFrom) {
    if(bAnswerToExit === true) {
      clearFormModal();
      //location.reload();
    }
    $("#last-save").empty();
      setViewHistoryOfSaves(data.editor);
    $("div[id='disPlay']").hide();
    if(data.message !== "Error!") {
      swal({
        title:"Successfully!",
        text:"The Document was updated successfully!",
        icon:"success",
        buttons:{cancel:false, confirm:"Close"}
      });
      $("button[name='save']").prop("disabled", true);
      $("button[name='save_close']").prop("disabled", true);
      if (sWayFrom != "save-close"){
        openDocumentBackInReadOnlyMode(data.doc_id);
      }
    }
  }

  function findDifferenceOfData(oNewData){ // if Edit Mode, then find what is changed
    var aPropetyName =  Object.keys(window.oDocumentContent);
    var aDifferencePropertyName = aPropetyName.filter(function(sKeys) {
      return oNewData[0][sKeys] !== window.oDocumentContent[sKeys] && (!!oNewData[0][sKeys] || (typeof oNewData[0][sKeys] === "string" && oNewData[0][sKeys].length === 0));
    });
    var array = [];
    var object = {};
    for(i in aDifferencePropertyName){
      object[aDifferencePropertyName[i]] = oNewData[0][aDifferencePropertyName[i]];
    }
    array.push(object)
    return array;
  }
  // Disable Enter key in Form
  $("form").bind("keypress", function (e) {
    if (e.keyCode == 13) {
      return false;
    }
  });
  //add, modify or clone entry
  $("button[data-toggle='modal']").click(function (e) {
    $("button[model-button='changing']").attr("name", $(this).attr("button-name"));
    if ($(this).attr("name") == "modify-entry") {
      // $("select option").attr("selected", false);
      clearSubRole();
      $('td[row-index="' + $(".data-table input:checked").attr("row-index") + '"]').each(function () {
        var modal_name = $("th[col-index="+$(this).attr("col-index")+"]").attr("modal-name");
        var value = $(this).text();
        $("[name='"+modal_name+"']").val(value);
      });
      // checkSubRole();
      categorySetup();
      checkTower();
      checkOrg();
    } else if ($(this).attr("name") == "delete-entry") {
      var $inputChecked = $(".data-table input:checked");
      let numb = $inputChecked.parent().parent().find("td:last-child");
      if($inputChecked.length !== 0){
        var nDelId = parseInt($inputChecked.closest("td")[0].getAttribute("id"));
        window.aSubDocDelete.push(nDelId);
        let temp = window.totalFTE - parseFloat(numb.text());
        window.totalFTE = temp.toFixed(2);
        $("[name='calc-fte']").html("Total FTE = "+parseFloat(temp).toFixed(2) );
        checkFTE();
        var table = read_table();
        table.splice(parseInt($inputChecked.attr("row-index"), 10), 1);
        write_table(table);
      } else {
        swal({
          title: "Attention!",
          text: "Not chosen record!",
          icon: "warning",
          buttons: { cancel: false, confirm: "Close" }
        });
      }
    }
    //do not run if not equals to searchButton
    if ($(this).attr("name") !== "searchButton") {
      SelectInRelationship("role", "subrole");  // Set correct select Relationship
      //SelectInRelationship("unit", "subunit");
    }
    checkTower();
    serviceRelationship();
    serviceInit();
    categorySetup();
  });
  // close modal
  $("button[model-button='changing-close']").click(function (e) {
    $("#form-modal").modal("hide");
    clearModal();
  });
  $("button[model-button='search-close']").click(function (e) {
    $("#modalSearchLegalContractNo").modal("hide");
  });
  $("select[name='center_name']").change(function (e) {
    if ($("select[name='center_name'] option:selected").val() != "") {
      $("input[name='center_flag']").val("YES");
      $("input[name='center_flag']").attr("value", "YES");
    } else {
      $("input[name='center_flag']").val("NO");
      $("input[name='center_flag']").attr("value", "NO");
    }
  });
} // openDocumentModal_EditMode =========== END

function getInputTable_view(DOMReftableData, oTableName) { // get Information from Sub-Document only for view
  var array = [];
  var nTR_Length = DOMReftableData.find("tr").length;
  for (var i = 0; i < nTR_Length; i++) {
    var nTD_Length = $(DOMReftableData.find("tr")[i]).find("td").length;
    var oRow = {};
    for (var j = 0; j < nTD_Length; j++) {
      if (j === 0) {
        // get sub-doc id
        // if not exist id, get another td
        if ($(DOMReftableData.find("tr")[i]).find("td")[j].attributes[1] === undefined) {
          continue;
        }
        // if it was exist, miss them
        if ($(DOMReftableData.find("tr")[i]).find("td")[j].getAttribute("old") !== null) {
          if(i === nTR_Length-1){ break; }
          i++; // next line (tr)
          j = -1; // start at 0 td
          continue;
        }
        var sObjPropertyName = $(DOMReftableData.find("tr")[i]).find("td")[j].attributes[1].nodeName;
        var sTD_Element = parseInt($(DOMReftableData.find("tr")[i]).find("td")[j].getAttribute(sObjPropertyName));
      } else {
        // get another value
        var sTD_Element = $(DOMReftableData.find("tr")[i]).find("td")[j].innerHTML;
        var sObjPropertyName = oTableName[j].getAttribute("modal-name");
      }
      oRow[sObjPropertyName] = sTD_Element;
    }
    if(Object.keys(oRow).length !== 0)  array.push(oRow);
  }
  return array;
}

document.onkeydown = function(event) { // Document may close with Esc btn
  if ($('#modal-personal-style').is(':visible')) {
    if (user === "RDB-RDB-Superuser" || user === "RDB_Editors" ) {
      if (event.keyCode == 27 && $("[name='edit-mode']").length === 0) { // if Client in Edit mode
        swalAndQuestionExit();
      } else if(event.keyCode == 27 && $("[name='edit-mode']").length !== 0){
        clearFormModal();
      }
    }else{ // another users
      if (event.keyCode == 27 && $("[name='save']").length === 0) {
        clearFormModal();
      } else if(event.keyCode == 27 && $("[name='save']").length !== 0){
        swalAndQuestionExit();
      }
    }
  } else {
    if (event.keyCode == 27) {
      return;
    }
  }
}

function swalAndQuestionExit() {
  swal({
    title: "Are you sure you want to exit the document? Ok?",
    icon: "warning",
    closeOnEsc: false,
    buttons: true,
    dangerMode: true,
  }).then((isExit) => {
    if(isExit){
      if( $("button[name='save']").attr("disabled") === "disabled"){
        location.reload();
      }
      clearFormModal();
      $("#disPlay").hide();
    }
  })
}

function clearFormModal() {
  for (i in $("[saveid]")) {
    $("[saveid]")[i].value = "";
  }
  $(".readTbody").empty();
  //$("select").empty();
  $("select:not(.doNotClear-select)").empty();
  $("#EditTable").empty();
  $("#totalFTE").empty();
  $("#forNew").empty();
  $(".modal-background").hide();
  $("html").css("overflow-y", "");
  $("[saveid]").attr("readonly", true);
  $("#HistoryOfSaves").empty();
  $(".HistoryField").hide();
  $("#last-save").empty();
  $(".last-time").show();
  $("[name='icon-ver']").removeClass();
  $("[name='calc-ver']").remove();
  $("button[name='load-bp']").remove();
  delete window.nOpenID;
  delete window.oDocumentContent;
  window.aSubDocDelete = [];
}

function createBtn_Primary_StandartAttributes(sName, sHTML, sStyle ) {
  var oBtn = document.createElement("button");
  oBtn.setAttribute("type", "button");
  oBtn.setAttribute("class", "btn btn-primary");
  oBtn.setAttribute("name", sName);
  oBtn.setAttribute("style", sStyle);
  oBtn.innerHTML = sHTML;
  return oBtn;
}

function enableNewDD() {
  $(".disabledSelect").attr("disabled", false);
}

function disablNewDD() {
  $(".disabledSelect").attr("disabled", true);
}

function checkIfExistClone(){
  sLoad_EMail = $("input[name='email']").val();
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
        text: "A record for this resource is already existing for Tower ["+countTower+"]! \n\nIgnore this message if you are creating a record under different Tower, otherwise locate with the search functionality the existing record and apply updates in that one.",
        icon: "warning"
      })
    }
  })
}