var requestify = require('requestify');


var token1 = Math.floor(1000 + Math.random() * 9000);

requestify.get('http://sendpk.com/api/sms.php?username=923427111995&password=3762&sender=CYRES&mobile=03427111995&message=Your verification code for Hostinn Acoount is ' + token1 + "\n Please enter the above code in the required field to reset password.")
                            .then(function (response) {
                                // Get the response body (JSON parsed or jQuery object for XMLs)
                                console.log(response.getBody());
                                res.json({
                                    "Error": false,
                                    "Message": "A Message has been sent on your mobile !",
                                });

                            }
                            );