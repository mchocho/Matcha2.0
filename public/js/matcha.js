function script() {
    const filter_btns = document.getElementById('filter_group').childNodes,
          slider_container = document.getElementById('slider_container'),
          slider_1     = document.getElementById('slider_1'),
          slider_2     = document.getElementById('slider_2'),
          age_1 = document.getElementById('age_1'),
          age_2 = document.getElementById('age_2');

    
    function isNode(el) {
        return (el instanceof Element);
    }

    for (let i = 0, n = filter_btns.length; i < n; i++) {
        filter_btns[i].addEventListener('click', function(e) {
            const value = e.target.textContent.trim();
           
            if (value === 'Age')
                slider_container.classList.remove('hide');
            else if (!slider_container.classList.contains('hide'))
                slider_container.classList.add('hide');
            filter_btns.forEach(function(value){
                if (isNode(value) && value.classList.contains('option'))
                    value.classList.remove('option');
            });
            e.target.classList.add('option');
        });
    }

    slider_1.addEventListener('change', function() {
        age_1.textContent = slider_1.value;
    });

    slider_2.addEventListener('change', function() {
        age_2.textContent = slider_2.value;
    });


    age_1.textContent = slider_1.value;
    age_2.textContent = slider_2.value;
}
document.addEventListener("DOMContentLoaded", script);
