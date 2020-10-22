function script() {
    const matches          = document.getElementById('matches');
    const filter_btns      = document.getElementById('filter_group').childNodes;
    const sort_btns        = document.getElementById('sort_group').childNodes;
    const slider_container = document.getElementById('slider_container');
    const slider_1         = document.getElementById('slider_1');
    const slider_2         = document.getElementById('slider_2');
    const age_btn          = document.getElementById('age');
    const age_1            = document.getElementById('age_1');
    const age_2            = document.getElementById('age_2');

    if ((sessionStorage.getItem('min_age')) && sessionStorage.getItem('max_age'))
    {
        slider_1.value = sessionStorage.getItem('min_age');
        slider_2.value = sessionStorage.getItem('max_age');

        console.log('slider value1: ', slider_1.value);
    }
    
    age_1.textContent = slider_1.value;
    age_2.textContent = slider_2.value;

    slider_1.addEventListener('change', () =>
    {
        age_1.textContent = slider_1.value;
        if (storageAvailable('sessionStorage'))
            sessionStorage.setItem('min_age', slider_1.value);
    });

    slider_2.addEventListener('change', () =>
    {
        age_2.textContent = slider_2.value;
        if (storageAvailable('sessionStorage'))
            sessionStorage.setItem('max_age', slider_2.value); 
    });

    age_btn.addEventListener('click', () =>
    {
        window.location = `/matcha/age.${encodeURIComponent(slider_1.value)}.${encodeURIComponent(slider_2.value)}`;
        return;
    });

    [...filter_btns].forEach((btn, i, arr) =>
    {
        btn.addEventListener('click', e =>
        {
            const target    = e.currentTarget;
            const val       = target.textContent.trim().toLowerCase();
           
            if (val === 'age')
                slider_container.classList.remove('hide');
            else if (!slider_container.classList.contains('hide'))
                slider_container.classList.add('hide');
            
            arr.forEach(value =>
            {
                if (value.classList.contains('option'))
                {
                    value.classList.remove('option');
                    
                    if (value !== target)
                    {
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
    });

    [...sort_btns].forEach((btn, i, arr) =>
    {
        btn.addEventListener('click', e =>
        {
            const target = e.currentTarget;
           
            arr.forEach(value =>
            {
                value.classList.remove('option');
                
                if (value !== target)
                    rotateMatches();
            });
            target.classList.add('option');
        });
    });
    
    function storageAvailable(type)
    {
        let     storage;
        const   x = 'N032195';
        
        try {
            storage = window[type];
            storage.setItem(x, x);
            storage.removeItem(x);
            return true;
        }
        catch(e) {
            return e instanceof DOMException && (e.code === 22 || e.code === 1014 || e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') && (storage && storage.length !== 0);
        }
    }

     function rotateMatches()
     {
        if (!matches) return; 

        const   fragment    = document.createDocumentFragment();
        let     children    = matches.childNodes;
        let     i           = children.length;

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
