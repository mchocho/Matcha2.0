function script() {
    const matches          = document.getElementById('matches'),
          filter_btns      = document.getElementById('filter_group').childNodes,
          sort_btns        = document.getElementById('sort_group').childNodes,
          slider_container = document.getElementById('slider_container'),
          slider_1         = document.getElementById('slider_1'),
          slider_2         = document.getElementById('slider_2'),
          age_1            = document.getElementById('age_1'),
          age_2            = document.getElementById('age_2');

    
    function isNode(el) {
        return (el instanceof Element);
    }

    for (let i = 0, n = filter_btns.length; i < n; i++) {
        filter_btns[i].addEventListener('click', function(e) {
            const target = e.target,
                  value = target.textContent.trim();
           
            if (value === 'Age')
                slider_container.classList.remove('hide');
            else if (!slider_container.classList.contains('hide'))
                slider_container.classList.add('hide');
            filter_btns.forEach(function(value){
                if (isNode(value) && value.classList.contains('option')) {
                    value.classList.remove('option');
                    if (value !== target) {
                        //FILTER THE LIST NOW
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
    });

    slider_2.addEventListener('change', function() {
        age_2.textContent = slider_2.value;
    });


    age_1.textContent = slider_1.value;
    age_2.textContent = slider_2.value;

    function rotateMatches() {
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
}
document.addEventListener("DOMContentLoaded", script);
