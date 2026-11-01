<?php

if (!empty($_POST['phone'])) {

    /*Адрес отправки*/
    //$emailTo = 'office@balldecor.ru,print@balldecor.ru';
   $emailTo = 'bivmur2@mail.ru';
    if($_POST['direction'] && $_POST['direction'] != ''){
        $direction = $_POST['direction'];
    }
    if ($_POST['type'] == "whatsapp-head"){
        $subject = 'Получение консультации';
        
        $tel = $_POST['phone'];

        $message = '<html>
            <head>
                <title>Получение консультации по WhatsApp</title>
            </head>
            <body>
                
                <p>Телефон1: '.$_POST['type'].'</p>
                <p><hr></p>
            </body>
        </html>';
        print_r($message);
    } else if ($_POST['type'] == "interview"){
        $subject = 'Опросник';
        $tel = $_POST['phone'];
        $email = $_POST['email'];
        $tematika = $_POST['tematika'];
        $kolichestvosharov = $_POST['kolichestvosharov'];
        $napolnenie = $_POST['napolnenie'];
        $sharysfigurami = $_POST['sharysfigurami'];
        $massovyizapusk = $_POST['massovyizapusk'];
        $pechatinasharah = $_POST['pechatinasharah'];
        $mestoidata = $_POST['mestoidata'];
        $mestoidata2 = $_POST['mestoidata2'];
        $vyberitepodarok = $_POST['vyberitepodarok'];

        $message = '<html>
			<head>
				<title>Опросник</title>
			</head>
			<body>
				<p>Телефон: '.$tel.'</p>
                <p>E-mail: '.$email.'</p>
				<p>Тематика: '.$tematika.'</p>
				<p>Количество шаров: '.$kolichestvosharov.'</p>
				<p>Наполнение:'.$napolnenie.'</p>
				<p>Шары с фигурами: '.$sharysfigurami.'</p>
				<p>Массовый запуск: '.$massovyizapusk.'</p>
                <p>Печати на шарах: '.$pechatinasharah.'</p>
                <p>Место: '.$mestoidata.'</p>
                <p>Дата: '.$mestoidata2.'</p>
                <p>Выберите подарок: '.$vyberitepodarok.'</p>
				<p>'.$direction.'</p>
				<p><hr></p>
	      	</body>
	    </html>';
        print_r($message);
    }


    /*Шапка письма*/
    $header = "Content-type: text/html; charset=\"utf-8\"\r\n";
    $header .= "From: Заявка balldecor.ru <balldecor_2088de29@1gb.ru>\r\n";
   
    if(mail($emailTo, $subject, $message, $header)){
        echo 'sendto';
    }
    else {
        echo 'error';
    }
}