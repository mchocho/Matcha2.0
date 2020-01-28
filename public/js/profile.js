function script() {
    const   profile_id = document.getElementById('profile_id').value,
            connect_status = document.getElementById('connection_status'),
            connection_btn = document.getElementById('connection_button');
          
    connection_btn.addEventListener('click', function(e) {
        xhr('/admin/connect/' + profile_id, 'POST', null, function(xhr) {
            //handle request

        });
    }, true);
}

document.addEventListener("DOMContentLoaded", script);