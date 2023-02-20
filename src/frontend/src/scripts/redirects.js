export function goBack(obj) {
    if (window.history.state.back != null) {
        obj.$router.back();
    } else {
        goTo(obj, '/');
    }
}

export function goHome(obj) {
    goTo(obj, '/');
}

export function goTo(obj, link) {
    if (link.startsWith('http')) {
        window.open(link, '_blank');
    } else {
        obj.$router.push(link);
    }
}

export function goToLink(obj) {
    const url = window.location.href;
    const params = new URLSearchParams(url);
    const link = params.get('link');
    
    if (!link) {
        console.info("No link found in URL");
        return;
    }
    goTo(link);
}