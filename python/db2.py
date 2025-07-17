# IBM DB2 object
import ibm_db
import datetime
import math
import time
import html
from urllib.parse import unquote


class db2_connection:
    def __init__(self, db="BLUDB", hostname="11966d87-7530-45c1-b7f2-02960ccc5c4f.c1ogj3sd0tgtu0lqde00.databases.appdomain.cloud", port="31019", uid="rdbprod", pwd="RDB_prodnewco2021", sslConnection = "ssl"):
        self.db = db
        self.hostname = hostname
        self.port = port
        self.uid = uid
        self.pwd = pwd
        self.sslConnection = sslConnection

        #self.db2conn = ibm_db.connect("DATABASE=" + db + ";HOSTNAME=" + hostname + ";PORT=" + port + ";UID=" + uid + ";PWD=" + pwd + ";", "", "")
        self.db2conn = ibm_db.connect("DATABASE=" + db + ";HOSTNAME=" + hostname + ";PORT=" + port + ";UID=" + uid + ";PWD=" + pwd + ";Security=" + sslConnection + ";", "", "")
        #self.connect_string = "DATABASE={};HOSTNAME={};PORT={};UID={};PWD={};"
        self.connect_string = "DATABASE={};HOSTNAME={};PORT={};UID={};PWD={};Security={};"
    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_value, traceback):
        ibm_db.close(self.db2conn)

    def execute(self, sql):
        ibm_db.exec_immediate(self.db2conn, sql)

    def sql_query(self, sql):
        message = ibm_db.exec_immediate(self.db2conn, sql)
        table = ibm_db.fetch_tuple(message)
        data = []
        while table != False:
            data.append(table)
            table = ibm_db.fetch_tuple(message)
        return data

    def do_select_exec(self, sql):
        conn_string = self.connect_string.format(self.db, self.hostname, self.port, self.uid, self.pwd)
        query_result = []
        connect = ""
        try:
            connect = ibm_db.connect(conn_string,'','')
        except Exception as e:
            print (e)
        stmt = ibm_db.exec_immediate(connect, sql)
        row = ibm_db.fetch_assoc(stmt)

        while row:
            query_result.append(row)
            row = ibm_db.fetch_assoc(stmt)
        return query_result

    # Used for 'tables'
    def table_sql(self, sql, id_used=False):
        print("Superuser tried: \n" + sql)
        try:
            if id_used:
                id_used = self.sql_query(sql)
            else:
                ibm_db.exec_immediate(self.db2conn, sql)

            print("\n Success")
            return "Success", id_used
        except:
            print("\n Error! \n"+ibm_db.stmt_errormsg())
            print(sql+"\n")
            print(ibm_db.stmt_errormsg())
            return "Error!", id_used

    # Used for document saving
    def document_insert(self, document_dict, subdocument_list, totalfte, user_id="missing"):
        # geo, mkt, mkt1 are sent as one field need to split
        if "geo-mkt-mkt1" in document_dict:
            tmp = document_dict.pop("geo-mkt-mkt1")
            tmp = tmp.split("-")
            try:
                document_dict["geo"] = tmp[0]
                document_dict["mkt"] = tmp[1]
                document_dict["mkt1"] = tmp[2]
            except:
                document_dict["geo"] = "(blank)"
                document_dict["mkt"] = "(blank)"
                document_dict["mkt1"] = "(blank)"
        document_columns = ""
        values = ""
        for key in document_dict:
            document_columns = document_columns + str(key) + ","
            values = values + "'" + html.unescape(unquote(str(document_dict[key]))).replace("'", "''") + "', "
        document_columns = document_columns[:-1]
        values = values[:-2]

        sql = ("select doc_id "
            "from final table (insert into document (" + document_columns + ") "
            "values(" + values + "))")
        document_id = self.sql_query(sql)
        document_id = document_id[0][0]

        subdocument_ids = self._subdocument_insert(subdocument_list, document_id)

        stamp = self._logging(document_id, user_id)

        time_indicator = ""
        if float(totalfte) == float(1):
            time_indicator = "Full Time"
        else:
            time_indicator = "Part Time"

        sql = ("Update document set (last_update_id, last_update_stamp, total_fte, time_indicator) = "
            "('" + str(user_id) + "','" + str(stamp) + "','" + str(totalfte) + "','" + str(time_indicator) + "') where doc_id = " + str(document_id))

        ibm_db.exec_immediate(self.db2conn, sql)

        return document_id, subdocument_ids, stamp, "Success"

    def _subdocument_insert(self, subdocument_list, document_id):
        subdocument_ids = []
        for subdocument in subdocument_list:

            column = ""
            values = ""
            for key in subdocument:
                column = column + str(key) + ","
                if key.lower() == "fte" or key.lower() == "o2o" or key.lower() == "pct" or key.lower() == "nonsom":
                    values = values + str(subdocument[key]) + ", "
                else:
                    values = values + "'" + html.unescape(unquote(str(subdocument[key]))).replace("'", "''") + "', "
            column = column[:-1]
            values = values[:-2]

            sql = ("Select id "
                "from final table (insert into subdocument (doc_id," + column + ") "
                "values (" + str(document_id) + "," + values + "))")

            sub_id = self.sql_query(sql)
            subdocument_ids.append(sub_id[0][0])

        return subdocument_ids

    def _logging(self, document_id, user_id, fields='New document'):
        fields = fields.replace("'", "")
        if len(fields) > 992:
            fields = "Most fields got changed!"

        sql = ("select stamp "
            "from final table (insert into doc_log (doc_id, user_id, fields,stamp) "
            "values (" + str(document_id) + ",'" + str(user_id) + "','" + str(fields) + "',(select VARCHAR_FORMAT(CURRENT TIMESTAMP, 'DD/MM/YYYY') from SYSIBM.SYSDUMMY1)))")

        stamp = self.sql_query(sql)

        return stamp[0][0]

    def document_update(self, doc_id, document_dict, subdocument_list, user_id, subdocument_delete, totalfte):
        # geo, mkt, mkt1 are sent as one field need to split
        if "geo-mkt-mkt1" in document_dict:
            tmp = document_dict.pop("geo-mkt-mkt1")
            tmp = tmp.split("-")
            try:
                document_dict["geo"] = tmp[0]
                document_dict["mkt"] = tmp[1]
                document_dict["mkt1"] = tmp[2]
            except:
                document_dict["geo"] = "(blank)"
                document_dict["mkt"] = "(blank)"
                document_dict["mkt1"] = "(blank)"

        # if there are no changed made to document shouldn't run this
        if len(document_dict) > 0:
            document_columns = ""
            values = ""
            for key in document_dict:
                document_columns = document_columns + str(key) + ","
                values = values + "'" + html.unescape(unquote(str(document_dict[key]))).replace("'", "''") + "',"
            document_columns = document_columns[:-1]
            values = values[:-1]

            sql = ("Update document set (" + document_columns + ") = "
                "(" + values + ") where doc_id = " + str(doc_id))

            self.execute(sql)

            # Makes log entry for document
            fields = "Changed document :-"
            for column, value in zip(document_columns.split(","), values.split(",")):
                fields = fields + str(column) + " :- " + str(value) + " ,"
            fields = fields[:-2] + ". "

        else:
            # Log entry for the document doesn't exists
            fields = ""

        # Added new subdocuments and changed existing ones
        subdocument_new = []
        subdocument_changes = ""

        for subdocument in subdocument_list:
            if not "id" in subdocument:
                subdocument_new.append(subdocument)
            else:
                subdocument_columns = ""
                subdocument_values = ""
                subdocument_id = subdocument.pop("id", None)

                for key in subdocument:
                    subdocument_columns = subdocument_columns + str(key) + ","
                    if key.lower() == "fte" or key.lower() == "o2o" or key.lower() == "pct":
                        subdocument_values = subdocument_values + str(subdocument[key]) + ","
                    else:
                        subdocument_values = subdocument_values + "'" + html.unescape(unquote(str(subdocument[key]))).replace("'", "''") + "',"

                subdocument_columns = subdocument_columns[:-1]
                subdocument_values = subdocument_values[:-1]

                sql = ("Update subdocument set (" + subdocument_columns + ") = "
                    "(" + subdocument_values + ") where id = " + str(subdocument_id))
                self.execute(sql)

                subdocument_changes = subdocument_changes + "Changed subdocument with id " + str(subdocument_id) + " :-"
                for column, value in zip(subdocument_columns.split(","), subdocument_values.split(",")):
                    subdocument_changes = subdocument_changes + str(column) + " :- " + str(value) + " ,"
                subdocument_changes = subdocument_changes[:-2] + ". "

        if len(subdocument_new) > 0:
            subdocument_ids = self._subdocument_insert(subdocument_new, doc_id)

            subdocument_changes = subdocument_changes + "Added new " + str(len(subdocument_ids)) + " subdocument(-s) with id(s)."

        else:
            subdocument_ids = "No new subdocuments!"

        # Delete subdocuments
        for subdocument_id in subdocument_delete:
            sql = "Delete from subdocument where id = " + str(subdocument_id)
            self.execute(sql)

        if len(subdocument_delete) > 0:
            subdocument_changes = subdocument_changes + " Deleted " + str(len(subdocument_delete)) + " subdocument(-s)."

        # Logs the changes
        fields = fields + subdocument_changes

        stamp = self._logging(doc_id, user_id, fields)

        time_indicator = ""
        if float(totalfte) == float(1):
            time_indicator = "Full Time"
        else:
            time_indicator = "Part Time"

        sql = ("Update document set (last_update_id, last_update_stamp, total_fte, time_indicator) = "
            "('" + str(user_id).replace("'", "''") + "','" + str(stamp) + "','" + str(totalfte) + "','" + str(time_indicator) + "') where doc_id = " + str(doc_id))

        self.execute(sql)

        return subdocument_ids, stamp, fields, "Success"

    # Used for view meta data saving
    def add_view(self, user_type, view_name, col_names, col_dict, col_group, col_sum, view_source, view_filter):
        if (type(user_type)!=str and type(view_name)!=str and type(col_names)!=str and type(col_dict)!=str and type(col_sum)!=str and type(view_source)!=str):
            return "Error!", "Values user_type, view_name, col_names, col_dict, col_sum and view_source must be passed as string values"

        if type(col_group)!=int:
            return "Error!", "Value col_group must be passed as an integer"

        # Insert stament
        sql=("insert into view_templates "
            "(user_type, view_name, col_names, col_dict, col_group, col_sum, view_source, view_filter) "
            "values('"+str(user_type)+"','"+str(view_name)+"','"+str(col_names)+"','"+str(col_dict)+"',"+str(col_group)+",'"+str(col_sum)+"','"+str(view_source)+"','"+str(view_filter)+"')")

        # Full sql
        sql = ("select view_id "
            "from final table ("+sql+")")

        view_id=self.sql_query(sql)
        view_id=view_id[0][0]

        return "Success", view_id

    def edit_view(self, view_id, user_type, view_name, col_names, col_dict, col_group, col_sum, view_source, view_filter):
        if (type(user_type)!=str and type(view_name)!=str and type(col_names)!=str and type(col_dict)!=str and type(col_sum)!=str and type(view_source)!=str):
            return "Error!", "Values user_type, view_name, col_names, col_dict, col_sum and view_source must be passed as string values"

        if type(col_group)!=int and type(view_id)!=int:
            return "Error!", "Values col_group and views_id must be passed as an integer"

        sql=("Update view_templates set "
            "(user_type, view_name, col_names, col_dict, col_group, col_sum, view_source, view_filter) = "
            "('"+user_type+"','"+view_name+"','"+col_names+"','"+col_dict+"',"+str(col_group)+",'"+col_sum+"','"+view_source+"','"+view_filter+"') "
            "where view_id = "+str(view_id))

        self.execute(sql)

        return "Success", "View meta data is updated"

    # Used for periodic agents
    def run_es_agent(self, es_tables):
        print("Running Engage support update ...")

        # org_s = ("'Q2C Operations'")
        # org_s_list = ["'Q2C Enablement'", "'Q2C Accounts Receivable'", "'Q2C Services'"]
        # Adding more Orgs for Q2C on 13-03-2023
        org_s_list = ["'Q2C Enablement'", "'Q2C Accounts Receivable'", "'Q2C Services'",
            "'Q2C Strategic Markets'", "'Q2C Top 10 Country'", "'Q2C Global Operational Enablement'", "'Q2C Global Accounts Receivable'"]

        for org_s in org_s_list:
            print(str(org_s) + " ES_TABLES: " + str(es_tables))
            
            for t in es_tables:
                update_existing_sql = ("MERGE INTO " + t + " AS d USING "
                    "(SELECT * FROM ENGAGESUPPORT) AS es "
                    "ON LOWER(d.EMAIL) = LOWER(es.EMAIL) AND (d.ORGANIZATION_S IN (" + str(org_s) + ")) WHEN MATCHED THEN UPDATE SET d.SQUAD_NAME = es.SQUAD_NAME, d.SQUAD_GROUP = es.SQUAD_GROUP;")

                self.execute(update_existing_sql)

                # when not matched does not work for some reason so lets use some simple version for non-matching row update
                update_nonexisting_sql = ("UPDATE " + t + " as d SET d.SQUAD_GROUP = NULL, d.SQUAD_NAME = NULL "
                    "WHERE (d.ORGANIZATION_S IN (" +  str(org_s) + ")) AND LCASE(d.EMAIL) NOT IN (SELECT LCASE(EMAIL) FROM ENGAGESUPPORT);")

                self.execute(update_nonexisting_sql)

        print("Engage support update finished.")

    def update_computed_values(self):
        print("Updateing geo, mkt, mkt1, organization")
        update_doc = ("UPDATE document D SET (GEO, MKT, MKT1) = (SELECT GEO, MKT, MKT1 FROM LOCATION_ROLL_UP RU WHERE D.COUNTRY_L = RU.COUNTRY),"
                      "ORGANIZATION_S = (SELECT ORGANIZATION FROM TOWER T WHERE D.TOWER = T.TOWER);")
        self.execute(update_doc)

        print("Updating Full Time/Part Time Indicator")
        updateFullTime = "UPDATE DOCUMENT SET TIME_INDICATOR = 'Full Time' WHERE TOTAL_FTE = 1;"
        self.execute(updateFullTime)
        updatePartTime = "UPDATE DOCUMENT SET TIME_INDICATOR = 'Part Time' WHERE TOTAL_FTE < 1;"
        self.execute(updatePartTime)

        print("Updating DOC.SQUAD_LEAD via SQUAD_CONFIG")
        sql_squadConfig = "SELECT SQUAD_LEAD_NOTES_ID, TOWER, SUBDOMAIN, SQUAD_GROUP, SQUAD_NAME FROM SQUAD_CONFIG"
        data_squadConfig =  self.sql_query(sql_squadConfig)
        for squadLead in data_squadConfig:
            #print("Squad Lead: " + str(squadLead))
            sql_squadLead = "UPDATE DOCUMENT SET SQUAD_LEAD = \'" + str(squadLead[0]).replace("'","\'\'") + "\' WHERE TOWER = \'" + str(squadLead[1]).replace("'","\'\'") + "\' AND SUBDOMAIN = \'" + str(squadLead[2]).replace("'","\'\'") + "\' AND SQUAD_GROUP = \'" + str(squadLead[3]).replace("'","\'\'") + "\' AND SQUAD_NAME = \'" + str(squadLead[4]).replace("'","\'\'") + "\'"
            self.execute(sql_squadLead)

        print("Updating Complete!")

    def load_archive(self, archive_tables, year=None, month=None, q=None):
        print("Starting archivation ...")
        now = datetime.datetime.now()
        if year is None:
            year = str(now.year)
            print("Default value for year is used")
        if month is None:
            month = str(now.month)
            print("Default value for month is used")
        if q is None:
            q = math.ceil(float(now.month) / 3)
            print("Default value for quarter is used")

        for t in archive_tables:
            # prepare columns to work with
            table_col = self.sql_query(("SELECT * "
                                        "FROM SYSIBM.SYSCOLUMNS "
                                        "WHERE TBNAME = '" + t + "' AND TBCREATOR = 'RDBPROD'"))

            cols = [i[0] for i in table_col]
            col_names = ','.join(cols)

            arch = t + "_ARCHIVE"

            if t == "DOCUMENT":
                # get document index modifier
                sql = "SELECT DOC_ID FROM " + arch + " ORDER BY DOC_ID DESC LIMIT 1;"
                print("Executing SQL: " + sql)
                doc_id = self.sql_query(sql)
                print("DOC_ID: " + str(doc_id))

                #for index in range(len(doc_id)):
                #    for key in doc_id[index]:
                #        doc_id= str(doc_id[index][key])
                try:
                    doc_id = str(doc_id[0][0])
                except:
                    doc_id = "0"
                print("DOC ID MODIFIER: " + doc_id)

                # load data to archive
                insert_doc = ("INSERT INTO " + arch + " (ARCH_MONTH,ARCH_QUARTER,ARCH_YEAR," + col_names + ")"
                            " SELECT '" + str(month) + "','" + str(q) + "','" + str(year) + "', " + col_names.upper().replace("DOC_ID", "(DOC_ID+" + doc_id + ")") + " FROM " + t + ";")
                print("Executing SQL: " + insert_doc)
                self.execute(insert_doc)

            elif t == "SUBDOCUMENT":
                subcols = cols.copy()
                subcol_names = ','.join(subcols)

                # get subdocument index modifier
                sql = "SELECT ID FROM " + arch + " ORDER BY ID DESC LIMIT 1;"
                subdoc_id = self.sql_query(sql)

                print("SUBDOC_ID MODIFIER: " + str(subdoc_id))

                #for index in range(len(subdoc_id)):
                #    for key in subdoc_id[index]:
                #        subdoc_id= str(subdoc_id[index][key])
                try:
                    subdoc_id = str(subdoc_id[0][0])
                except:
                    subdoc_id = "0"

                # load data to archive
                insert_sdoc = ("INSERT INTO " + arch + " (ARCH_MONTH,ARCH_QUARTER,ARCH_YEAR," + subcol_names + ")" + " SELECT '" + str(month) + "','" + str(q) + "','" + str(year) + "'," + col_names.upper().replace("ID", "(ID+" + subdoc_id + ")") + " FROM " + t +";")
                print("Executing SQL for SUBDOC PT 1: " + insert_sdoc)
                insert_sdoc=insert_sdoc.replace("DOC_(ID+" + subdoc_id+")","(DOC_ID+" + doc_id + ")")
                print("Executing SQL for SUBDOC PT 2: " + insert_sdoc)

                self.execute(insert_sdoc)
            print("Archived ", t)

        print("Archivation finished.")
