$(document).ready(function() {
    
    $('#termsCheck').on('change', function() {
        if ($(this).is(':checked')) {
            $('#placeOrderBtn').prop('disabled', false);
        } else {
            $('#placeOrderBtn').prop('disabled', true);
        }
    });
    
    $('input[name="paymentMethod"]').on('change', function() {
        if ($(this).val() === 'card') {
            $('#cardDetails').show();
        } else {
            $('#cardDetails').hide();
        }
    });
    
    $('#checkoutForm').on('submit', function(e) {
        e.preventDefault();
        
        var isValid = true;
        
        $('#fullName').each(function() {
            if ($(this).val() === '') {
                isValid = false;
                $(this).addClass('is-invalid');
            } else {
                $(this).removeClass('is-invalid');
            }
        });
        
        $('#email').each(function() {
            if ($(this).val() === '') {
                isValid = false;
                $(this).addClass('is-invalid');
            } else {
                $(this).removeClass('is-invalid');
            }
        });
        
        $('#phone').each(function() {
            if ($(this).val() === '') {
                isValid = false;
                $(this).addClass('is-invalid');
            } else {
                $(this).removeClass('is-invalid');
            }
        });
        
        $('#city').each(function() {
            if ($(this).val() === '') {
                isValid = false;
                $(this).addClass('is-invalid');
            } else {
                $(this).removeClass('is-invalid');
            }
        });
        
        $('#postalCode').each(function() {
            if ($(this).val() === '') {
                isValid = false;
                $(this).addClass('is-invalid');
            } else {
                $(this).removeClass('is-invalid');
            }
        });
        
        $('#country').each(function() {
            if ($(this).val() === '') {
                isValid = false;
                $(this).addClass('is-invalid');
            } else {
                $(this).removeClass('is-invalid');
            }
        });
        
        if ($('input[name="paymentMethod"]:checked').val() === 'card') {
            $('#cardName').each(function() {
                if ($(this).val() === '') {
                    isValid = false;
                    $(this).addClass('is-invalid');
                } else {
                    $(this).removeClass('is-invalid');
                }
            });
            
            $('#cardNumber').each(function() {
                if ($(this).val() === '') {
                    isValid = false;
                    $(this).addClass('is-invalid');
                } else {
                    $(this).removeClass('is-invalid');
                }
            });
            
            $('#cardExpiry').each(function() {
                if ($(this).val() === '') {
                    isValid = false;
                    $(this).addClass('is-invalid');
                } else {
                    $(this).removeClass('is-invalid');
                }
            });
            
            $('#cardCVV').each(function() {
                if ($(this).val() === '') {
                    isValid = false;
                    $(this).addClass('is-invalid');
                } else {
                    $(this).removeClass('is-invalid');
                }
            });
        }
        
        if (!$('#termsCheck').is(':checked')) {
            isValid = false;
        }
        
        if (isValid) {
            alert('Order placed successfully! Thank you for your purchase.');
        }
    });
    
    $('#placeOrderBtn').on('click', function() {
        $('#checkoutForm').submit();
    });
    
    $('#applyCoupon').on('click', function() {
        alert('Coupon code applied successfully! (Demo only)');
    });
    
});

