// $( document ).ready(function() {

	$.getJSON("/_web_page_block", {
		action: "GET",
	}).done(state => {
		$('button[name=block-state]').attr('disabled', false)
		$('button[name=block-state]').show()
		if(state.is_web_page_blocked == 'on') {
			blockButton(false)
		} else {
			blockButton(true)
		}
	})


	function blockButton(state) {
		if(state) {
			$('#block-status').text('BLOCKED').css("color", "red")
			$('button[name=block-state]').text('UNBLOCK')
			$('button[name=block-state]').attr('state', 'on')
		} else {
			$('#block-status').text('ACTIVE').css("color", "blue")
			$('button[name=block-state]').text('BLOCK')
			$('button[name=block-state]').attr('state', 'off')
		}
	}

	$('button[name=block-state]').click((event) =>{
		const sAction = $(event.currentTarget).attr("state")
		swal({
			title: "Are you sure you want to change the state?",
			icon: "warning",
			closeOnEsc: false,
			buttons: true,
			dangerMode: true,
		  }).then(answer => {
			  if(answer) {
				$("#disPlay").show();
				$(".personal-style-spin-text").hide()
				$.getJSON("/_web_page_block", {
					action: "change",
					state: sAction,
				}).done(message => {
					if(message.message == 'Success') {
						if(sAction === 'off') {
							blockButton(true)
						} else {
							blockButton(false)
						}
					}
				}).fail(error => {
					swal({
						title: 'Error!',
						text: "Action failed: " + error.statusText,
						icon: "error",
						buttons: {
							cancel: false,
							confirm: "Close"
						}
					})
				}).always(() => {
					$("#disPlay").hide();
					$(".personal-style-spin-text").show()
				})
			  }

		  })

	})

	//Function
    function toTitleCase(str) {
	    return str.replace(
	        /\w*/g,
	        function(txt) {
	            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
	        }
	    );
    }

    function get_item(dict, array, repValues)
	{
		for(var i = 0; i < array.length; i++)
		{
			if(!dict || !dict.hasOwnProperty(array[i])){return "";}
			dict = dict[array[i]];
		}

		if(repValues)
		{
			for(var i = 0; i < repValues.length; i++)
			{
				dict = (dict.toString()).replace(repValues[i][0], repValues[i][1]);
			}
		}

		return dict;
    }

	function msToTime(s)
	{
		var ms = s % 1000;
		s = (s - ms) / 1000;
		var secs = s % 60;
		s = (s - secs) / 60;
		var mins = s % 60;
		var hrs = (s - mins) / 60;

		return hrs + ":" + mins + ":" + secs + "." + ms;
	}

	// Update GEO-MKT-MKT1
	$("button[name='computed_values_update']").click(function(){

	});

	// User side BLUEPAGECHECK
	$("button[name='instant_bp_update']").click(function(e){

		swal({
			title: "Are you sure?",
			text: "1000 unique emails take about 40 minutes to update.",
			icon: "warning",
			buttons: true,
			dangerMode: true,
		  }).then(answer => {

			if(answer) {
				aDocuments = [];
				updateBluePagesData(aDocuments);

			} else {
				//
			}


		  })


	});

	function updateBluePagesData(aDocuments)
	{
		$("#disPlay").show();
		$.getJSON("/_for_bp", {
			"emails": JSON.stringify(aDocuments)
		}).done(workData => {
			// Starting Variables
			//url = "https://w3-services1.w3-969.ibm.com/myw3/unified-profile/v1/docs/instances/masterByEmail?email=" //OLD URL
			url = "https://bluepages.ibm.com/BpHttpApisv3/slaphapi?ibmperson/mail="
			url2 = ".list/byjson?*"

			// Seperating data based on - is in BP
			var x = workData["documents"].length;
			for(var i = 0; i < x; i++)
			{
				var o = performance.now();
				email = workData["documents"][i][0];
				jQuery.ajax({
					url:url + email + url2,
					success:function(bpAnswer)
					{

						if (bpAnswer.search.entry.length == 0) {
							jQuery.ajax({
								url:"/_update_bp",
								data:{update_data:email, bp_status:"notBP"},
								async:false
							});

						} else {

								var x;
								var userDict = bpAnswer.search.entry[0].attribute;
								var infoDict = {};

								for (x=0; x < userDict.length; x++){
									infoDict[String(userDict[x].name).toLowerCase()] = userDict[x].value[0];
								}

								dict = {

									'name':get_item(infoDict,["cn"]),
									'first_name':get_item(infoDict,["preferredfirstname"]),
									'last_name':get_item(infoDict,["preferredlastname"]),
									'title':get_item(infoDict,["jobresponsibilities"]),

									'notes_id':get_item(infoDict,["notesid"]),
									'personal_nmbr':get_item(infoDict,["uid"]),
									'country_l':get_item(infoDict,["co"]),
									'country_c':get_item(infoDict,["employeecountrycode"]),
									'dep':get_item(infoDict,["dept"]),
									//removed//'cost_center':get_item(bpAnswer,["content","identity_info","costCenter"]),
									'manager_flag':get_item(infoDict, ["ismanager"]),
									//--?--//'city':get_item(bpAnswer,["content","identity_info","address","business","locality"]),
									'div':get_item(infoDict,["div"]),
									'location':get_item(infoDict,["workloc"]),

									'office':get_item(infoDict,["workplaceindicator"]),
									'orgcode':get_item(infoDict,["hrorganizationcode"])
									//removed//'language':get_item(bpAnswer,["content","identity_info","languages"]),

								}

								dict['name']=toTitleCase(dict['name']);
								dict['first_name']=toTitleCase(dict['first_name']);
								dict['last_name']=toTitleCase(dict['last_name']);

								dict["email"] = email;
								var workloc = get_item(infoDict,["workloc"]);
								var hrOrgCode = get_item(infoDict,["hrorganizationcode"]);
								var empType = get_item(infoDict,["employeetype"]);
								var manager1 = get_item(infoDict,["manager"]);
								var manager2 = "";
								var fmanager1 = get_item(infoDict,["glteamlead"]);
								var fmanager2 = "";
								var fmanager3 = "";

								//City Info
								jQuery.ajax({
									url:"https://bluepages.ibm.com/BpHttpApisv3/slaphapi?ibmworklocation/(workloc=" + String(workloc) + ").list/byjson?*",
									success:function(result){
										var x;
										var userDict = result.search.entry[0].attribute;
										var locDict = {};

										for (x=0; x < userDict.length; x++){
											locDict[String(userDict[x].name).toLowerCase()] = String(userDict[x].value[0]);
										}

										dict["city"]=get_item(locDict,["l"]);
									},
									async:false
								});

								//Organization Info
								jQuery.ajax({
									url:"https://bluepages.ibm.com/BpHttpApisv3/slaphapi?ibmOrganization/(hrOrganizationCode=" + String(hrOrgCode) + ").list/byjson?*",
									success:function(result){
										var x;
										var userDict = result.search.entry[0].attribute;
										var orgDict = {};

										for (x=0; x < userDict.length; x++){
											orgDict[String(userDict[x].name).toLowerCase()] = String(userDict[x].value[0]);
										}

										dict["organization_f"]=get_item(orgDict,["hrorganizationdisplay"]);
										dict["bu"]=get_item(orgDict,["hrgroupid"]);
									},
									async:false
								});

								//Employee Code Info
								jQuery.ajax({
									url:"https://bluepages.ibm.com/BpHttpApisv3/slaphapi?IBMEmployeetype/(employeetypecode=" + String(empType) + ").list/byjson?*",
									success:function(result){
										var x;
										var userDict = result.search.entry[0].attribute;
										var empDict = {};

										for (x=0; x < userDict.length; x++){
											empDict[String(userDict[x].name).toLowerCase()] = String(userDict[x].value[0]);
										}

										dict["employee_code"]=get_item(empDict,["title"]);
									},
									async:false
								});

								//manager 1 info
								jQuery.ajax({
									url:"https://bluepages.ibm.com/BpHttpApisv3/slaphapi?ibmperson/(uid=" + String(manager1).substring(4,13) + ").list/byjson?*",
									success:function(result){
										var x;
										var userDict = result.search.entry[0].attribute;
										var man1Dict = {};

										for (x=0; x < userDict.length; x++){
											man1Dict[String(userDict[x].name).toLowerCase()] = String(userDict[x].value[0]);
										}

										dict["manager_1_notes_id"]=get_item(man1Dict,["notesid"]);
										dict["manager_1_email"]=get_item(man1Dict,["emailaddress"]);
										dict["manager_1_name"]=get_item(man1Dict,["cn"]);
										dict["manager_1_num"]=get_item(man1Dict,["uid"]);
										dict["manager_1_first"]=get_item(man1Dict,["preferredfirstname"]);
										dict["manager_1_last"]=get_item(man1Dict,["preferredlastname"]);

										dict['manager_1_name']=toTitleCase(dict['manager_1_name']);
										dict['manager_1_first']=toTitleCase(dict['manager_1_first']);
										dict['manager_1_last']=toTitleCase(dict['manager_1_last']);

										manager2 = get_item(man1Dict,["manager"]);
									},
									async:false
								});

								//manager 2 info
								jQuery.ajax({
									url:"https://bluepages.ibm.com/BpHttpApisv3/slaphapi?ibmperson/(uid=" + String(manager2).substring(4,13) + ").list/byjson?*",
									success:function(result){
										var x;
										var userDict = result.search.entry[0].attribute;
										var man2Dict = {};

										for (x=0; x < userDict.length; x++){
											man2Dict[String(userDict[x].name).toLowerCase()] = String(userDict[x].value[0]);
										}

										dict["manager_2_notes_id"]=get_item(man2Dict,["notesid"]);
										dict["manager_2_email"]=get_item(man2Dict,["emailaddress"]);
										dict["manager_2_name"]=get_item(man2Dict,["cn"]);
										dict["manager_2_num"]=get_item(man2Dict,["uid"]);
										dict["manager_2_first"]=get_item(man2Dict,["preferredfirstname"]);
										dict["manager_2_last"]=get_item(man2Dict,["preferredlastname"]);
									},
									async:false
								});

								//functional manager 1 info
								jQuery.ajax({
									url:"https://bluepages.ibm.com/BpHttpApisv3/slaphapi?ibmperson/(uid=" + String(fmanager1).substring(4,13) + ").list/byjson?*",
									success:function(result){
										var x;
										var userDict = result.search.entry[0].attribute;
										var fman1Dict = {};

										for (x=0; x < userDict.length; x++){
											fman1Dict[String(userDict[x].name).toLowerCase()] = String(userDict[x].value[0]);
										}

										dict["rep_notes_id"]=get_item(fman1Dict,["notesid"]);
										dict["rep_email"]=get_item(fman1Dict,["emailaddress"]);
										dict["rep_name"]=get_item(fman1Dict,["cn"]);
										dict["rep_num"]=get_item(fman1Dict,["uid"]);
										dict["rep_first"]=get_item(fman1Dict,["preferredfirstname"]);
										dict["rep_last"]=get_item(fman1Dict,["preferredlastname"]);

										dict['rep_name']=toTitleCase(dict['rep_name']);
										dict['rep_first']=toTitleCase(dict['rep_first']);
										dict['rep_last']=toTitleCase(dict['rep_last']);

										fmanager2 = get_item(fman1Dict,["glteamlead"]);
									},
									async:false
								});

								//functional manager 2 info
								jQuery.ajax({
									url:"https://bluepages.ibm.com/BpHttpApisv3/slaphapi?ibmperson/(uid=" + String(fmanager2).substring(4,13) + ").list/byjson?*",
									success:function(result){
										var x;
										var userDict = result.search.entry[0].attribute;
										var fman2Dict = {};

										for (x=0; x < userDict.length; x++){
											fman2Dict[String(userDict[x].name).toLowerCase()] = String(userDict[x].value[0]);
										}

										dict["rep_2_notes_id"]=get_item(fman2Dict,["notesid"]);
										dict["rep_2_email"]=get_item(fman2Dict,["emailaddress"]);
										dict["rep_2_name"]=get_item(fman2Dict,["cn"]);
										//dict["rep_2_num"]=get_item(fman2Dict,["uid"]);
										//dict["rep_2_first"]=get_item(fman2Dict,["preferredfirstname"]);
										//dict["rep_2_last"]=get_item(fman2Dict,["preferredlastname"]);
										fmanager3 = get_item(fman2Dict,["glteamlead"]);
									},
									async:false
								});

								//functional manager 3 info
								jQuery.ajax({
									url:"https://bluepages.ibm.com/BpHttpApisv3/slaphapi?ibmperson/(uid=" + String(fmanager3).substring(4,13) + ").list/byjson?*",
									success:function(result){
										var x;
										var userDict = result.search.entry[0].attribute;
										var fman3Dict = {};

										for (x=0; x < userDict.length; x++){
											fman3Dict[String(userDict[x].name).toLowerCase()] = String(userDict[x].value[0]);
										}

										dict["rep_3_notes_id"]=get_item(fman3Dict,["notesid"]);
										dict["rep_3_email"]=get_item(fman3Dict,["emailaddress"]);
										dict["rep_3_name"]=get_item(fman3Dict,["cn"]);
										//dict["rep_3_num"]=get_item(fman3Dict,["uid"]);
										//dict["rep_3_first"]=get_item(fman3Dict,["preferredfirstname"]);
										//dict["rep_3_last"]=get_item(fman3Dict,["preferredlastname"]);
									},
									async:false
								});

								if(dict['country_l']!="USA"){dict['country_l']=toTitleCase(dict['country_l']);}

								//if(dict['language'] != ""){dict['language'] = dict['language'].join();}

								try {
									dict['manager_2_name']=toTitleCase(String(dict['manager_2_name']));
									dict['manager_2_first']=toTitleCase(String(dict['manager_2_first']));
									dict['manager_2_last']=toTitleCase(String(dict['manager_2_last']));
								} finally {
									//New condition for Kyndryl accounts
									if (empType.toLowerCase() == 'h'){
										jQuery.ajax({
											url:"/_update_bp",
											data:{update_data:JSON.stringify(dict), bp_status:"inBP"},
											async:false
										});
									} else if (empType.toLowerCase() == 'c'){
										var ventureCode = get_item(infoDict,["venturecode"]);
										if (ventureCode.toLowerCase() == 'nc' || ventureCode.toLowerCase() == 'nv'){
											jQuery.ajax({
												url:"/_update_bp",
												data:{update_data:JSON.stringify(dict), bp_status:"inBP"},
												async:false
											});
										} else {
											jQuery.ajax({
												url:"/_update_bp",
												data:{update_data:email, bp_status:"notBP"},
												async:false
											});
										}
									} else {
										jQuery.ajax({
											url:"/_update_bp",
											data:{update_data:email, bp_status:"notBP"},
											async:false
										});
									}

								}
						}
					},
					error:function(XMLHttpRequest, textStatus, errorThrown){
						jQuery.ajax({
							url:"/_update_bp",
							data:{update_data:email, bp_status:"notBP"},
							async:false
						});
					},
					async:false
				});

				var n = performance.now();
				$("span[name='loadingInfo']").html("Updating Bluepages data (" + i.toString() + " / " + x.toString() + ")<br/>Estimated time remaining: " + msToTime(((n - o) * (x - i))));
			}


			$("#disPlay").hide();
			swal({
				title: "Successfully!",
				text: "Instant Bluepages check completed!",
				icon: "success",
				buttons: {
					cancel: false,
					confirm: "Close"
					}
				});
		});
	}

	// Manual ARCHIVING
	$("button[name='instant_arch_update']").click(function(e){
		swal({
			title:"Confirmation",
			text:"Are you certain you wish to archive all live documents? \n Selected values: Y: " + $("#year").val() + ", M: " + $("#month").val() + ", Q: " + $("#q").val(),
			icon:"warning",
			buttons:true,
			dangerMode:true,
		}).then(answer => {if(answer){archiveAllDocument($("#year").val(), $("#month").val(), $("#q").val());}})
	});

	function archiveAllDocument(year, month, quarter)
	{
		$("#disPlay").show();
		$("span[name='loadingInfo']").html("Archiving live documents");

		var xmlHttp = new XMLHttpRequest();
		var url = "/handle_archive_request?year=" + year + "&month=" + month + "&q=" + quarter;

		xmlHttp.open("GET", url, true);

		xmlHttp.onreadystatechange = function(){
			if(this.readyState == 4 && this.status == 200)
			{
				$("#disPlay").hide();
				var msg = this.responseText;

				if(msg == "Document archived")
				{
					swal({
						title:"Successfully!",
						text:msg,
						icon:"success",
						buttons:{cancel:false, confirm:"Close"}
					});
				}
				else
				{
					swal({
						title:"Error!",
						text:msg,
						icon:"error",
						buttons:{cancel:false, confirm:"Close"}
					});
				}
			}
		};

		xmlHttp.timeout = 120000;
		xmlHttp.ontimeout = function(e){
			$("#disPlay").hide();
			swal({
				title:"Successfully!",
				text:"Document archived",
				icon:"success",
				buttons:{cancel:false, confirm:"Close"}
			});
		};

		xmlHttp.send();
	}

	// CSV data load
	$("button[name='instant_csv_file_load']").click(function(e){
		$("#disPlay").show();
		$("span[name='loadingInfo']").html("Loading documents into database");

		var xmlHttp = new XMLHttpRequest();
		var url = "/load_csv_data?csv_file=" + $("#csv-file").val();

		xmlHttp.open("GET", url, true);

		xmlHttp.onreadystatechange = function(){
			if(this.readyState == 4 && this.status == 200)
			{
				$("#disPlay").hide();
				var msg = this.responseText;

				if(msg == "Success!")
				{
					swal({
						title:"Successfully!",
						text:msg,
						icon:"success",
						buttons:{cancel:false, confirm:"Close"}
					});
				}
				else
				{
					swal({
						title:"Error!",
						text:msg,
						icon:"error",
						buttons:{cancel:false, confirm:"Close"}
					});
				}
			}
		};

		xmlHttp.send();
	});

	$("#bpUpdateAll").click(function(){
		if ($(this).is(':checked')) {
        $('#instant_bp_update').prop('disabled', false);
				$('#runFilter').css('display','none');
    } else {
        $('#instant_bp_update').prop('disabled', true);
				$('#runFilter').css('display','block');
    }
	});

	$("button[name='instant_bp_update_w_filters']").click(function(e){
		swal({
			title: "Are you sure?",
			text: "Even with filters, 1000 unique emails take about 40 minutes to update.",
			icon: "warning",
			buttons: true,
			dangerMode: true,
		  }).then(answer => {
			if(answer) {
				var tower = document.getElementById("runTower").value;
				var org = document.getElementById("runOrg").value;
				aDocuments = [];
				aDocuments.push("BPRefreshFilter");
				aDocuments.push(tower);
				aDocuments.push(org);
				updateBluePagesData(aDocuments);
			} else {
				//
			}
		  })
	});
