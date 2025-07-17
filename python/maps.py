## Variable that are used in multiple maps
Email="email"
empType="employee_code"
Name="name"
FirstName="first_name"
LastName="last_name"
nameutf="nameutf"
title="title"
Organization="organization_f"
noteMail="notes_id"
tower="tower"
tower_org="organization_s"
Pdb="personal_nmbr"
status="status"

country="country_l"
CCode="country_c"
Dept="dep"
CC="cost_center"
table_c_1a2="geo-mkt-mkt1"
MgrFlag="manager_flag"
City="city"
Div="div"
Workloc="location"
BU="bu"
Location="office"
OrgCode="orgcode"

Manager1="manager_1_notes_id"
Manager1Email="manager_1_email"
Manager1Name="manager_1_name"
Manager1Num="manager_1_num"
Manager1FirstName="manager_1_first"
Manager1LastName="manager_1_last"
Manager2="manager_2_notes_id"
Manager2Email="manager_2_email"
Manager2Name="manager_2_name"
Manager2Num="manager_2_num"
Manager2FirstName="manager_2_first"
Manager2LastName="manager_2_last"

RepManager="rep_notes_id"
RepManagerEmail="rep_email"
RepManagerName="rep_name"
RepManagerNum="rep_num"
RepManagerFirstName="rep_first"
RepManagerLastName="rep_last"

Rep2Manager = "rep_2_notes_id"
Rep2ManagerEmail = "rep_2_email"
Rep2ManagerName = "rep_2_name"

Rep3Manager = "rep_3_notes_id"
Rep3ManagerEmail = "rep_3_email"
Rep3ManagerName = "rep_3_name"

center="center_name"
center_flag="center_flag"
squad_group="squad_group"
squad_name="squad_name"
squad_description="squad_desc"
Language="language"
area="area"
remarks="remarks"

geo="rep_country"
role="role"
subrole="subrole"
unit="unit"
subunit="subunit"
channel="channel"
o2o="o2o"
pct="pct"

# Dict's for documents and subdocuments
def get_document_subdocument_log_map():
    doc_list = ['doc_id',Email,empType,Name,FirstName,LastName,#nameutf:"",
        title,Organization,noteMail,tower,tower_org,Pdb,status,country,CCode,Dept,CC,'geo',
        'mkt','mkt1',MgrFlag,City,Div,Workloc,BU,Location,OrgCode,Manager1,Manager1Email,Manager1Name,
        Manager1Num,Manager1Num,Manager1LastName,Manager2,Manager2Email,Manager2Name,Manager2Num,
        Manager2Num,Manager2LastName,RepManager,RepManagerEmail,RepManagerName,RepManagerNum,
        RepManagerFirstName,RepManagerLastName,center,center_flag,squad_group,squad_name,
        squad_description,Language,area,remarks,'last_update_id','last_update_stamp','total_fte','job_position','approval_evidence',
        'accelerate_role','start_date','conversion_date','end_date','contract_end_date',
        'rep_2_notes_id','rep_2_email','rep_2_name','rep_3_notes_id','rep_3_email','rep_3_name','subdomain','squad_lead']

    subdoc_list = ['id',geo,role,subrole,o2o,unit,subunit,channel,pct,'fte','cust_name','cust_contract','comments','nonsom','service_line','service_category','client','primary_category','secondary_category']

    doc_log__list = ['id', 'stamp','user_id','fields']

    return doc_list, subdoc_list, doc_log__list


# Dict's for table mapping
def get_db2_table_map(version="default"):
    if version=="default":
        # Table display name as key and value list of all the columns. _ is a space
        db2_map={
            "Tower":["ID","TOWER","Organization"],
            "Status":["ID","STATUS"],
            "Location_roll_up":["ID","GEO","MKT","MKT1","COUNTRY"],
            "Supported_geo_in_details":["ID","GEO","MKT","COUNTRY","ORGANIZATION"],
            "Center":["ID","CENTER_NAME"],
            "Role":["ID","ORGANIZATION","ROLE","SUBROLE","ACCELERATE_ROLE"],
            "Brand":["ID","UNIT","SUBUNIT"],
            "Channel":["ID","CHANNEL"],
            "Area":["ID","AREA"],
            "Supported_Country_in_Roll_Up":["ID","SUPPORT_COUNTRY", "SUPPORT_IMT", "SUPPORT_IOT", "SUPPORT_TOP_GEO", "ORG2014", "ORG2015", "ORG2016", "ORG2017", "ORG2018"],
			"Tower_Groups":["ID","BLUEGROUP", "TOWER"],
            "RDB_Global_Users":["ID", "EMAIL", "ORG"],
            "EAM_Service":["ID", "SERVICE_LINE", "SERVICE_CATEGORY"],
            "Category_Primary":["ID", "CATEGORY"],
            "Category_Secondary":["ID", "CATEGORY"],
            "Client":["ID", "Client"],
            "Unit":["ID", "Organization","Unit","Subunit"],
            "Job_Position":["ID", "JOB_POSITION"]
        }
    elif version=="keys":
        # Table display name as key and value is the name of the table in db.
        db2_map={
            "Tower":"tower",
            "Status":"status_name",
            "Location_roll_up":"Location_Roll_Up",
            "Supported_geo_in_details":"Supported_Geo_in_Details",
            "Center":"center",
            "Role":"role",
            "Brand":"brand",
            "Channel":"channel",
            "Area":"AREA",
            "Supported_Country_in_Roll_Up":"supported_country_roll_up",
			"Tower_Groups":"Tower_Groups",
            "RDB_Global_Users":"RDB_Global_Users",
            "EAM_Service":"EAM_Service",
            "Category_Primary":"Category_Primary",
            "Category_Secondary":"Category_Secondary",
            "Client":"Client",
            "Unit":"Unit",
            "Job_Position":"Job_Position"
        }

    return db2_map

# BP enrchment map - has all the values that will be loaded from BP and there respective keys
# and requirements for them
def get_bp():
    ##first number - if propercases needed
    #0-no,1-yes
    ##second number - if another load of bp needed
    #0=second bp search, 1=second search + take take thrid search info, 2=third search info
    bp_map={
        Email:[0,"content","identity_info","preferredIdentity"],
        noteMail:[0,"content","identity_info","notesEmail"],
        Pdb:[0,"content","identity_info","uid"],
        title:[0,"content","identity_info","role"],
        #Unit:[0,"content","identity_info","co"],
        Location:[0,"content","identity_info","workplaceIndicator"],
        Workloc:[0,"content","identity_info","workLocation","code"],
        Dept:[0,"content","identity_info","dept","code"],
        Div:[0,"content","identity_info","div"],
        OrgCode:[0,"content","identity_info","org","code"],
        country:[1,"content","identity_info","co"],
        MgrFlag:[0,"content","identity_info","employeeType","isManager"],
        CCode:[0,"content","identity_info","employeeCountryCode"],
        Language:[0,"content","identity_info","languages"],
        FirstName:[1,"content","identity_info","name","first"],
        LastName:[1,"content","identity_info","name","last"],
        Name:[1,"content","identity_info","nameFull"],
        City:[0,"content","identity_info","address","business","locality"],
        #workplace:[0,"content","identity_info","address","business","address"],
        CC:[0,"content","identity_info","costCenter"],
        empType:[0,"content","identity_info","employeeType","title"],
        Organization:[0,"content","identity_info","org","title"],
        BU:[0,"content","identity_info","org","group"],
        Manager1Num:[0,"content","identity_info","inCountryManager","uid"],
        Manager1Email:[0,"content","identity_info","inCountryManager","preferredIdentity"],
        Manager1FirstName:[1,"content","identity_info","inCountryManager","name","first"],
        Manager1LastName:[1,"content","identity_info","inCountryManager","name","last"],
        Manager1Name:[1,"content","identity_info","inCountryManager","nameDisplay"],
        Manager1:[0,0,Manager1Email,"content","identity_info","notesEmail"],
        Manager2Num:[0,0,Manager1Email,"content","identity_info","inCountryManager","uid"],
        Manager2Email:[0,1,Manager1Email,Manager2,"content","identity_info","inCountryManager","preferredIdentity"],
        Manager2FirstName:[1,0,Manager1Email,"content","identity_info","inCountryManager","name","first"],
        Manager2LastName:[1,0,Manager1Email,"content","identity_info","inCountryManager","name","last"],
        Manager2Name:[1,0,Manager1Email,"content","identity_info","inCountryManager","nameDisplay"],
        Manager2:[0,2,Manager2,"content","identity_info","notesEmail"],
        RepManagerNum:[0,"content","identity_info","functionalManager","uid"],
        RepManagerEmail:[0,"content","identity_info","functionalManager","preferredIdentity"],
        RepManagerFirstName:[1,"content","identity_info","functionalManager","name","first"],
        RepManagerLastName:[1,"content","identity_info","functionalManager","name","last"],
        RepManagerName:[1,"content","identity_info","functionalManager","nameDisplay"],
        RepManager:[0,0,RepManagerEmail,"content","identity_info","notesEmail"]
    }
    return bp_map

# Clone of get_bp() but modified for new ED API instead of BP API
def get_bp2():
    ##first number - if propercases needed
    #0-no,1-yes
    ##second number - if another load of bp needed
    #0=second bp search, 1=second search + take take thrid search info, 2=third search info
    bp_map={
        Email:[0,"mail"],
        noteMail:[0,"notesemail"],
        Pdb:[0,"uid"],
        title:[0,"jobresponsibilities"],

        Location:[0,"workplaceindicator"],
        Workloc:[0,"workloc"],
        Dept:[0,"dept"],
        Div:[0,"div"],
        OrgCode:[0,"hrorganizationcode"],
        country:[1,"co"],
        MgrFlag:[0,"ismanager"],
        CCode:[0,"employeecountrycode"],
        #Language:[0,"content","identity_info","languages"],
        FirstName:[1,"preferredfirstname"],
        LastName:[1,"preferredlastname"],
        Name:[1,"cn"],
        City:[0,"city"],

        #CC:[0,"content","identity_info","costCenter"],
        empType:[0,"emptypetitle"],
        Organization:[0,"hrorganizationdisplay"],
        BU:[0,"hrgroupid"],
        Manager1Num:[0,"manager1_uid"],
        Manager1Email:[0,"manager1_preferredidentity"],
        Manager1FirstName:[1,"manager1_preferredfirstname"],
        Manager1LastName:[1,"manager1_preferredlastname"],
        Manager1Name:[1,"manager1_fullname"],
        Manager1:[0,"manager1_notesid"],

        Manager2Num:[0,"manager2_uid"],
        Manager2Email:[0,"manager2_preferredidentity"],
        Manager2FirstName:[1,"manager2_preferredfirstname"],
        Manager2LastName:[1,"manager2_preferredlastname"],
        Manager2Name:[1,"manager2_fullname"],
        Manager2:[0,"manager2_notesid"],

        RepManagerNum:[0,"fManager1_UID"],
        RepManagerEmail:[0,"fManager1_preferredidentity"],
        RepManagerFirstName:[1,"fManager1_preferredfirstname"],
        RepManagerLastName:[1,"fManager1_preferredlastname"],
        RepManagerName:[1,"fManager1_fullname"],
        RepManager:[0,"fManager1_notesemail"],

        Rep2ManagerEmail:[0,"fManager2_preferredidentity"],
        Rep2ManagerName:[1,"fManager2_fullname"],
        Rep2Manager:[0,"fManager2_notesemail"],

        Rep3ManagerEmail:[0,"fManager3_preferredidentity"],
        Rep3ManagerName:[1,"fManager3_fullname"],
        Rep3Manager:[0,"fManager3_notesemail"]

    }
    return bp_map

# Document time form map
def time_form_names():
    first_section_n = [Email,empType, noteMail, Name, Email, title, Organization, FirstName, LastName, tower, tower_org, Pdb, status]
    first_section_h = [country, Dept, CCode, CC, table_c_1a2, MgrFlag, City, Div, Workloc, BU, Location, OrgCode]
    second_section = [Manager1, Manager1Email, Manager1Name, Manager1Num, Manager1FirstName, Manager1LastName,
                    Manager2, Manager2Email, Manager2Name, Manager2Num, Manager2FirstName, Manager2LastName,
                    RepManager, RepManagerEmail, RepManagerName, RepManagerNum, RepManagerFirstName, RepManagerLastName]
    third_section = [center, center_flag, squad_group, squad_name, squad_description, Language, area, remarks]
    modal = [geo, role, subrole, unit, subunit, channel, o2o, pct]

    return first_section_n,first_section_h,second_section,third_section,modal

# Document time form select's options - select's keys:[sql,sql]
def time_form_select_map():
    map_of_selects = {
        tower:[("select a.id,a.tower "
            "from tower a "
            "order by a.tower")],
        tower_org:[("select a.id,a.organization "
            "from tower a "
            "order by a.organization")],
        status:[("select status "
            "from status_name "
            "group by status")],
        table_c_1a2:[("select listagg(country, ', '),concat(concat(concat(concat(geo,'-'),mkt),'-'),mkt1) "
            "from Location_Roll_Up "
            "group by concat(concat(concat(concat(geo,'-'),mkt),'-'),mkt1) "
            "order by concat(concat(concat(concat(geo,'-'),mkt),'-'),mkt1)")],
        center:[("select center_name "
            "from center "
            "order by center_name")],
        geo:["geo",
        ("select row_number() over() rownumber, geo, organization "
            "from Supported_Geo_in_Details "
            "where geo not like '' "
            "group by geo, organization"),
        ("select row_number() over() rownumber, mkt, organization "
            "from Supported_Geo_in_Details "
            "where mkt not like '' "
            "group by mkt, organization"),
        ("select row_number() over() rownumber, country, organization "
            "from Supported_Geo_in_Details "
            "where country not like '' "
            "group by country, organization")],
        role:[("select row_number() over() rownumber, role, organization "
            "from role "
            "group by role, organization "
            "order by role")],
        subrole:[("select b.rownumber, a.subrole, a.organization "
            "from role as a, (select row_number() over() rownumber, role, organization "
            "from role "
            "group by role, organization "
            "order by role) as b "
            "where a.role like b.role and  a.organization like b.organization "
            "order by a.subrole")],
        unit:[("select row_number() over() rownumber,unit "
            "from brand "
            "group by unit "
            "order by unit")],
        subunit:[("select b.rownumber, a.subunit "
            "from brand as a,("
                "select row_number() over() rownumber,unit "
                "from brand "
                "group by unit"
            ") as b "
            "where a.unit like b.unit "
            "order by a.subunit")],
        channel:[("select channel "
            "from channel "
            "order by channel")],
        area:[("select area "
            "from area "
            "order by area")]
    }
    return map_of_selects
