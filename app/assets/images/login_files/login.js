(function(){Template.login.events({

    'click input[type=submit]': function(e, t) {
        e.preventDefault();
        // retrieve the input field values
        var email = t.find('#login_username').value,
            password = t.find('#login_pass').value;

        // Trim and validate your fields here.... 

        // If validation passes, supply the appropriate fields to the
        // Meteor.loginWithPassword() function.
        Meteor.loginWithPassword(email, password, function(err) {
            if (err) {
                // The user might not have been found, or their passwword
                // could be incorrect. Inform the user that their
                // login attempt has failed. 
                console.log(err);
                throwError(err.reason);
            }

            // The user has been logged in.
        });
        return false;
    }
});

Template.login.rendered = function() {

    $('#login_toggle').click(function() {
        $('#frm_login').show();
        $('#frm_register').hide();
    })
    $('#register_toggle').click(function() {
        $('#frm_login').hide();
        $('#frm_register').show();
    })

    $(".lazy").lazyload({
        effect: "fadeIn"
    });

    $('#login-form').validate({

        focusInvalid: false,
        ignore: "",
        rules: {
            txtusername: {
                minlength: 2,
                required: true
            },
            txtpassword: {
                required: true,
            }
        },

        invalidHandler: function(event, validator) {
            //display error alert on form submit    
        },

        errorPlacement: function(label, element) { // render error placement for each input type   
            $('<span class="error"></span>').insertAfter(element).append(label)
            var parent = $(element).parent('.input-with-icon');
            parent.removeClass('success-control').addClass('error-control');
        },

        highlight: function(element) { // hightlight error inputs

        },

        unhighlight: function(element) { // revert the change done by hightlight

        },

        success: function(label, element) {
            var parent = $(element).parent('.input-with-icon');
            parent.removeClass('error-control').addClass('success-control');
        },
        submitHandler: function(form) {
            form.submit();
        }
    });
};

})();
