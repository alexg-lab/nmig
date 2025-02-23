<h3>NMIG - the database migration tool.</h3>

<h3>WHAT IS IT ALL ABOUT?</h3>
<p>NMIG is an app, intended to make a process of migration
from MySQL to PostgreSQL as easy and smooth as possible.</p>

----------------------------------

Forked from https://github.com/AnatolyUss/nmig

----------------------------------

<h3>Differences between this fork and the original:</h3>

<h4>v 5.6.2:</h4>
</h5>Release Notes:</h5>
<ul>
<li>Use timestamp(0) instead timestamp() for column type (use_timestamp_0_instead_timestamp: boolean; config option)</li>
<li>Use text instead varchar/varchar(n) for column type (use_text_instead_varchar: boolean; config option)</li>
<li>Use timestamp(3) instead timestamp() for column type</li>
</ul>

<h4>v 5.6.1:</h4>
</h5>Release Notes:</h5>
<ul>
<li>Set DEFAULT NULL to columns (for add null::character varying / null::number / etc in Default Values) (set_column_default_null config option)</li>
<li>Use original index names without generate programmatically or autogenerate by postgree (set_column_default_null config option)</li>
<li>Generate index names programmatically, or autogenerate by postgree (generate_index_names config option)</li>
<li>Specifies the list of mysql index name - postgree index name. Can be used to rename a specific long index name that postgree automatically cuts (64 symbols limit for index names) (manual_index_names config option)</li>
<li>Do not set DEFAULT NULL to columns without specified default value in mysql (set_column_default_null: boolean; config option)</li>
<li>Use manual, original or generate index name (manual_index_names, use_original_index_names, generate_index_names config options). If options use_original_index_names and generate_index_names options is disabled, Postgree auto generate standard index name. You can override the names of certain indices using an option (for example, for too long names of indices which exceed 64 characters and will be truncated for a more readable naming)</li>
</ul>

<h4>v 5.6.0:</h4>
</h5>Release Notes:</h5>
<br>
</h5>Features:</h5>
<ul>
<li>Migrate only schema (config option, for do not run DataPipeManager, DataPoolManager and BinaryDataDecored)</li>
<li>Mysql to Postgree partial text/varchar indexes support (config option)</li>
<li>After migrate sqls (config option)</li>
</ul>

</h5>Fixes:</h5>
<ul>
<li>Renamed config.json to config.json.example</li>
<li>Added config.json to .gitignore</li>
<li>Functions in lowercase for default values were not considered</li>
<li>Parentheses for mysql functions for default values were not considered</li>
<li>Index name with index number prefix for duplicate names only</li>
<li>Fix for null::character varying in Default Value. But this modification is commented, if necessary, uncomment in DefaultProcessor.ts (see comment: Fix for null:: character variety...)</li>
</ul>

----------------------------------

<h3>KEY FEATURES</h3>
<ul>
<li> Precise migration of the database structure - NMIG converts
   MySQL data types to corresponding PostgreSQL data types, creates constraints,
   indexes, primary and foreign keys exactly as they were before migration.</li>

<li>Ability to rename tables and columns during migration.</li>
<li>Ability to recover migration process if disaster took place without restarting from the beginning.</li>
<li>Ability to migrate big databases fast - in order to migrate data NMIG utilizes PostgreSQL COPY protocol.</li>
<li>Ease of monitoring - NMIG will provide detailed output about every step, it takes during the execution.</li>
<li>
 Ease of configuration - all the parameters required for migration should be put in one single JSON document.
 </li>
</ul>

<h3>SYSTEM REQUIREMENTS</h3>
<ul>
<li> <b>Node.js 10 or higher</b></li>
</ul>

<h3>USAGE</h3>
<p><b>1.</b> Create a new PostgreSQL database.<br />
   <b>Sample:</b>&nbsp;<code> CREATE DATABASE my_postgresql_database;</code><br />
   If you are planning to migrate spatial data (geometry type columns), then <b>PostGIS</b> should be installed and enabled.
</p>

<p><b>2.</b> Download Nmig package and put it on the machine running your PostgreSQL (not mandatory, but preferably).<br />
   <b>Sample:</b>&nbsp;<code>/path/to/nmig</code></p>

<p><b>3.</b> Edit configuration file located at <code>/path/to/nmig/config/config.json</code> with correct details.<br /></p>
<b>Notes:</b>
   <ul>
   <li> config.json contains brief description of each configuration parameter</li>
   <li>Make sure, that username, you use in your PostgreSQL connection details, defined as superuser (usually "postgres")<br> More info: <a href="http://www.postgresql.org/docs/current/static/app-createuser.html">http://www.postgresql.org/docs/current/static/app-createuser.html</a></li>
   <li>
   <ul>
   <li>As an option, you can move the entire <code>config</code> folder out of Nmig's directory and place it in any location</li>
   <li>As an option, you can store the Nmig's logs in any location. All you need to do is to create the <code>nmig_logs</code> directory</li>
   </ul>
   </li>
   </ul>

<p><b>4.</b> Go to Nmig directory, install dependencies, compile and run the app<br />
    <b>Sample:</b><br />
    <pre>$ cd /path/to/nmig</pre><br />
    <pre>$ npm install</pre><br />
    <pre>$ npm run build</pre><br />
    <pre>$ npm start</pre><br />
    <b>Or, if you have moved <code>config</code> folder out from Nmig's directory:</b><br /><br />
    <pre>npm start -- --conf-dir='/path/to/nmig_config' --logs-dir='/path/to/nmig_logs'</pre><br />

<p><b>5.</b> If a disaster took place during migration (for what ever reason) - simply restart the process
<code>$ npm start</code><br />
Or, if you have moved <code>config</code> folder out from Nmig's directory:<br />
<code>$ npm start -- --conf-dir='/path/to/nmig_config' --logs-dir='/path/to/nmig_logs'</code><br />

&nbsp;&nbsp;&nbsp;&nbsp;NMIG will restart from the point it was stopped at.
</p>

<p><b>6.</b> At the end of migration check log files, if necessary.<br />&nbsp;&nbsp;&nbsp;
   Log files will be located under "logs_directory" folder in the root of the package.<br />&nbsp;&nbsp;&nbsp;
   <b>Note:</b> If you've created <code>nmig_logs</code> folder outside the nmig's directory than "logs_directory" will reside in <code>nmig_logs</code>.
   <br />
   <b>Note:</b> "logs_directory" will be created during script execution.</p>


<p><b>7.</b> In case of any remarks, misunderstandings or errors during migration,<br /> &nbsp;&nbsp;&nbsp;
   please feel free to email me
   <a href="mailto:anatolyuss@gmail.com?subject=NMIG">anatolyuss@gmail.com</a></p>

<h3>RUNNING TESTS</h3>
<p><b>1.</b> Create a new PostgreSQL database.<br />
   <b>Sample:</b>&nbsp;<code> CREATE DATABASE nmig_test_db;</code><br />
</p>
<p><b>2.</b> Download Nmig package.<br/><b>Sample:</b>&nbsp;<code>/path/to/nmig</code></p>
<p><b>3.</b> Edit configuration file located at <code>/path/to/nmig/config/test_config.json</code> with correct details.<br /></p>
<b>Notes:</b>
<ul>
   <li> test_config.json contains brief description of each configuration parameter</li>
   <li>Make sure, that username, you use in your PostgreSQL connection details, defined as superuser (usually "postgres")<br>
        More info:
        <a href="http://www.postgresql.org/docs/current/static/app-createuser.html">http://www.postgresql.org/docs/current/static/app-createuser.html</a>
   </li>
   <li>
      <ul>
      <li>As an option, you can move the entire <code>config</code> folder out of Nmig's directory and place it in any location</li>
      <li>As an option, you can store the Nmig's logs in any location. All you need to do is to create the <code>nmig_logs</code> directory</li>
      </ul>
    </li>
</ul>
<p><b>4.</b> Go to nmig directory, install dependencies, compile and run tests<br />
    <b>Sample:</b><br />
    <pre>$ cd /path/to/nmig</pre><br />
    <pre>$ npm install</pre><br />
    <pre>$ npm run build</pre><br />
    <pre>$ npm test</pre><br />
    <b>Or, if you have moved <code>config</code> folder out from Nmig's directory:</b><br /><br />
    <pre>npm test -- --conf-dir='/path/to/nmig_config' --logs-dir='/path/to/nmig_logs'</pre><br />
</p>
<p><b>5.</b> At the end of migration check log files, if necessary.<br />&nbsp;&nbsp;&nbsp;
   Log files will be located under "logs_directory" folder in the root of the package.<br />&nbsp;&nbsp;&nbsp;
<b>Note:</b> If you've created <code>nmig_logs</code> folder outside the nmig's directory than "logs_directory" will reside in <code>nmig_logs</code>.
<br /><b>Note:</b> "logs_directory" will be created during script execution.</p>

<h3>VERSION</h3>
<p>Current version is 5.6.2<br />

<h3>LICENSE</h3>
<p>NMIG is available under "GNU GENERAL PUBLIC LICENSE" (v. 3) <br />
<a href="http://www.gnu.org/licenses/gpl.txt">http://www.gnu.org/licenses/gpl.txt.</a></p>
