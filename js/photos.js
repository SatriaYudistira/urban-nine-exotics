/* Stock photos (Wikimedia Commons, free licences) used on the Research page and About section.
   Hotlinked from upload.wikimedia.org; each needs its credit shown, which UNEPhotos.figure() does.
   They illustrate care topics and morphs only. Never use them as photos of animals for sale. */
window.UNEPhotos = (() => {
  const IMG = {
    "cover": {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e5/Python-regius-kopf-k%C3%B6nigspython.jpg/{w}px-Python-regius-kopf-k%C3%B6nigspython.jpg",
      "page": "https://commons.wikimedia.org/wiki/File:Python-regius-kopf-k%C3%B6nigspython.jpg",
      "by": "Holger Krisp",
      "lic": "CC BY 3.0",
      "licUrl": "https://creativecommons.org/licenses/by/3.0"
    },
    "about": {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f5/Pyton_kr%C3%B3lewski_%22Piebald%22_%22Smile%22.jpg/{w}px-Pyton_kr%C3%B3lewski_%22Piebald%22_%22Smile%22.jpg",
      "page": "https://commons.wikimedia.org/wiki/File:Pyton_kr%C3%B3lewski_%22Piebald%22_%22Smile%22.jpg",
      "by": "Dr.Zoidberg2186",
      "lic": "CC BY 4.0",
      "licUrl": "https://creativecommons.org/licenses/by/4.0"
    },
    "juvenile": {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b3/Juvenile_ball_python.jpg/{w}px-Juvenile_ball_python.jpg",
      "page": "https://commons.wikimedia.org/wiki/File:Juvenile_ball_python.jpg",
      "by": "Michael McConville",
      "lic": "CC BY 4.0",
      "licUrl": "https://creativecommons.org/licenses/by/4.0"
    },
    "setup": {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/ca/Butter_champagne_ball_python_at_Pinellas_County_Reptiles%2C_Aug_2020.jpg/{w}px-Butter_champagne_ball_python_at_Pinellas_County_Reptiles%2C_Aug_2020.jpg",
      "page": "https://commons.wikimedia.org/wiki/File:Butter_champagne_ball_python_at_Pinellas_County_Reptiles,_Aug_2020.jpg",
      "by": "MatthewHoobin",
      "lic": "CC BY-SA 4.0",
      "licUrl": "https://creativecommons.org/licenses/by-sa/4.0"
    },
    "rock": {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f1/Ball_python_and_rock.jpg/{w}px-Ball_python_and_rock.jpg",
      "page": "https://commons.wikimedia.org/wiki/File:Ball_python_and_rock.jpg",
      "by": "Lisaw123",
      "lic": "Public domain",
      "licUrl": ""
    },
    "mating": {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/47/Ball_Python_Mating.png/{w}px-Ball_Python_Mating.png",
      "page": "https://commons.wikimedia.org/wiki/File:Ball_Python_Mating.png",
      "by": "WingedWolfPsion",
      "lic": "CC BY-SA 3.0",
      "licUrl": "https://creativecommons.org/licenses/by-sa/3.0"
    },
    "gravid": {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/6a/Gravid_Ball_Python.jpg/{w}px-Gravid_Ball_Python.jpg",
      "page": "https://commons.wikimedia.org/wiki/File:Gravid_Ball_Python.jpg",
      "by": "WingedWolfPsion",
      "lic": "CC BY-SA 3.0",
      "licUrl": "https://creativecommons.org/licenses/by-sa/3.0"
    },
    "basking": {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/17/Ball_Python_Inverted_Basking.jpg/{w}px-Ball_Python_Inverted_Basking.jpg",
      "page": "https://commons.wikimedia.org/wiki/File:Ball_Python_Inverted_Basking.jpg",
      "by": "WingedWolfPsion",
      "lic": "CC BY-SA 3.0",
      "licUrl": "https://creativecommons.org/licenses/by-sa/3.0"
    },
    "eggs": {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ab/Ball_Python_Eggs_Incubating.jpg/{w}px-Ball_Python_Eggs_Incubating.jpg",
      "page": "https://commons.wikimedia.org/wiki/File:Ball_Python_Eggs_Incubating.jpg",
      "by": "WingedWolfPsion",
      "lic": "CC BY-SA 3.0",
      "licUrl": "https://creativecommons.org/licenses/by-sa/3.0"
    },
    "normal": {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ae/Queen_Alphabet_the_ball_python%2C_Capen_Hill_Nature_Sanctuary_2026-07-10.jpg/{w}px-Queen_Alphabet_the_ball_python%2C_Capen_Hill_Nature_Sanctuary_2026-07-10.jpg",
      "page": "https://commons.wikimedia.org/wiki/File:Queen_Alphabet_the_ball_python,_Capen_Hill_Nature_Sanctuary_2026-07-10.jpg",
      "by": "Peter Cooper Jr.",
      "lic": "CC0",
      "licUrl": "http://creativecommons.org/publicdomain/zero/1.0/deed.en"
    },
    "pied": {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/cf/Piebald_%28Pied%29_Ball_Python.jpg/{w}px-Piebald_%28Pied%29_Ball_Python.jpg",
      "page": "https://commons.wikimedia.org/wiki/File:Piebald_(Pied)_Ball_Python.jpg",
      "by": "Eclipse Exotics",
      "lic": "CC BY-SA 3.0",
      "licUrl": "https://creativecommons.org/licenses/by-sa/3.0"
    },
    "albino": {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9c/Albino_ball_python.png/{w}px-Albino_ball_python.png",
      "page": "https://commons.wikimedia.org/wiki/File:Albino_ball_python.png",
      "by": "WingedWolfPsion",
      "lic": "CC BY-SA 3.0",
      "licUrl": "https://creativecommons.org/licenses/by-sa/3.0"
    },
    "hypo": {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/27/Python_regius_-_hypomelanistic.png/{w}px-Python_regius_-_hypomelanistic.png",
      "page": "https://commons.wikimedia.org/wiki/File:Python_regius_-_hypomelanistic.png",
      "by": "WingedWolfPsion",
      "lic": "CC BY-SA 3.0",
      "licUrl": "https://creativecommons.org/licenses/by-sa/3.0"
    },
    "blackpastel": {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/65/Black_Pastel_Ball_Python.JPG/{w}px-Black_Pastel_Ball_Python.JPG",
      "page": "https://commons.wikimedia.org/wiki/File:Black_Pastel_Ball_Python.JPG",
      "by": "Kaorte",
      "lic": "CC BY-SA 3.0",
      "licUrl": "https://creativecommons.org/licenses/by-sa/3.0"
    },
    "bumblebee": {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/47/Citrus_Bumblebee_Ball_Python.jpg/{w}px-Citrus_Bumblebee_Ball_Python.jpg",
      "page": "https://commons.wikimedia.org/wiki/File:Citrus_Bumblebee_Ball_Python.jpg",
      "by": "Kaorte",
      "lic": "CC BY-SA 3.0",
      "licUrl": "https://creativecommons.org/licenses/by-sa/3.0"
    },
    "lavender": {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ee/Lavender_Albino_Ball_Python.JPG/{w}px-Lavender_Albino_Ball_Python.JPG",
      "page": "https://commons.wikimedia.org/wiki/File:Lavender_Albino_Ball_Python.JPG",
      "by": "Kaorte",
      "lic": "CC BY-SA 3.0",
      "licUrl": "https://creativecommons.org/licenses/by-sa/3.0"
    },
    "mojaveenchi": {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0c/Mochi_Ball_Python.JPG/{w}px-Mochi_Ball_Python.JPG",
      "page": "https://commons.wikimedia.org/wiki/File:Mochi_Ball_Python.JPG",
      "by": "Kaorte",
      "lic": "CC BY-SA 3.0",
      "licUrl": "https://creativecommons.org/licenses/by-sa/3.0"
    },
    "lesser": {
      "src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8e/Lesser_and_Lesser_Axanthic_Ball_Python.jpg/{w}px-Lesser_and_Lesser_Axanthic_Ball_Python.jpg",
      "page": "https://commons.wikimedia.org/wiki/File:Lesser_and_Lesser_Axanthic_Ball_Python.jpg",
      "by": "Kaorte",
      "lic": "CC BY-SA 3.0",
      "licUrl": "https://creativecommons.org/licenses/by-sa/3.0"
    }
  };

  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const url = (k, w = 960) => IMG[k].src.replace('{w}', w);
  const credit = (k) => { const i = IMG[k]; return 'Photo: <a href="' + esc(i.page) + '" target="_blank" rel="noopener">' + esc(i.by) + '</a>, ' + (i.licUrl ? '<a href="' + esc(i.licUrl) + '" target="_blank" rel="noopener">' + esc(i.lic) + '</a>' : esc(i.lic)); };
  /* <figure> with lazy image, caption and credit. */
  function figure(k, { caption = '', alt = caption, w = 960, cls = 'r-fig', eager = false } = {}) {
    return '<figure class="' + cls + '"><img src="' + esc(url(k, w)) + '" alt="' + esc(alt) + '"' + (eager ? '' : ' loading="lazy"') + ' decoding="async" referrerpolicy="no-referrer"><figcaption>' + (caption ? '<span>' + esc(caption) + '</span> ' : '') + '<span class="credit">' + credit(k) + '</span></figcaption></figure>';
  }
  return { IMG, url, credit, figure };
})();
