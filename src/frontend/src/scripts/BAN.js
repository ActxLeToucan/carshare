class BAN {
    static link = "https://api-adresse.data.gouv.fr/search"

    static #makeRequest(params) {
        return new Promise((resolve, reject) => {
            const stringParams = Object.keys(params).map(key => key + '=' + params[key]).join('&');
            fetch(BAN.link + "?" + stringParams).then(res => {
                if (res.ok) {
                    res.json().then(json => {
                        resolve(json.features.map(feature => {
                            return {
                                name: feature.properties.name,
                                city: feature.properties.city,
                                postcode: feature.properties.postcode,
                                lat: feature.geometry.coordinates[1],
                                lng: feature.geometry.coordinates[0]
                            }
                        }));
                    });
                } else {
                    reject(res);
                }
            }).catch(err => { reject(err); });
        });
    }

    static searchCities(search) {
        return this.#makeRequest({ q: search, type: "municipality" });
    }

    static search(search) {
        return this.#makeRequest({ q: search });
    }
}

export default BAN;