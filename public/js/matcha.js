function script() {
    const matches          = document.getElementById('matches'),
          filter_btns      = document.getElementById('filter_group').childNodes,
          sort_btns        = document.getElementById('sort_group').childNodes,
          slider_container = document.getElementById('slider_container'),
          slider_1         = document.getElementById('slider_1'),
          slider_2         = document.getElementById('slider_2'),
          age_btn          = document.getElementById('age'),
          age_1            = document.getElementById('age_1'),
          age_2            = document.getElementById('age_2');

    
    function isNode(el) {
        return (el instanceof Element);
    }

    function storageAvailable(type) {
        var storage;
        try {
            storage = window[type];
            var x = 'N032195';
            storage.setItem(x, x);
            storage.removeItem(x);
            return true;
        }
        catch(e) {
            return e instanceof DOMException && (e.code === 22 || e.code === 1014 || e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') && (storage && storage.length !== 0);
        }
    }

     function rotateMatches() {
        if (!matches) return; 
        let children = matches.childNodes,
            fragment = document.createDocumentFragment(),
            i = children.length;

        i--;
        while (i >= 0)
            fragment.appendChild(children[i--]);
        
        while(matches.hasChildNodes())
            matches.removeChild(matches.firstChild);

        matches.appendChild(fragment);
        return;
    }

    for (let i = 0, n = filter_btns.length; i < n; i++) {
        filter_btns[i].addEventListener('click', function(e) {
            const target = e.target,
                  val = target.textContent.trim().toLowerCase();
           
            if (val === 'age')
                            slider_container.classList.remove('hide');
                        else if (!slider_container.classList.contains('hide'))
                            slider_container.classList.add('hide');
            filter_btns.forEach(function(value){
                if (isNode(value) && value.classList.contains('option')) {
                    value.classList.remove('option');
                    if (value !== target) {
                        if (val === 'none')
                            document.getElementById('none').click();
                        else if (val === 'location')
                            document.getElementById('location').click();
                        else if (val === 'tags')
                            document.getElementById('tags').click();
                    }
                }
            });
            target.classList.add('option');
        });
    }

    for (let i = 0, n = sort_btns.length; i < n; i++) {
        sort_btns[i].addEventListener('click', function(e) {
            const target = e.target;
           
            sort_btns.forEach(function(value){
                if (isNode(value) && value.classList.contains('option')) {
                    value.classList.remove('option');
                    if (value !== target) {
                        rotateMatches();
                    }
                }
            });
            target.classList.add('option');
        });
    }

    slider_1.addEventListener('change', function() {
        age_1.textContent = slider_1.value;
        if (storageAvailable('sessionStorage')) sessionStorage.setItem('min_age', slider_1.value);
    });

    slider_2.addEventListener('change', function() {
        age_2.textContent = slider_2.value;
        if (storageAvailable('sessionStorage')) sessionStorage.setItem('max_age', slider_2.value); 
    });

    age_btn.addEventListener('click', function() {
        window.location = `/matcha/age.${encodeURIComponent(slider_1.value)}.${encodeURIComponent(slider_2.value)}`;
        return;
    });


    if ((sessionStorage.getItem('min_age')) && sessionStorage.getItem('max_age')) {
        slider_1.value = sessionStorage.getItem('min_age');
        slider_2.value = sessionStorage.getItem('max_age');

        console.log('slider value1: ', slider_1.value);
    }
    
    age_1.textContent = slider_1.value;
    age_2.textContent = slider_2.value;
}
document.addEventListener("DOMContentLoaded", script);
