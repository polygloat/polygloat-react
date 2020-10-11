import {usePolygloatContext} from "./usePolygloatContext";
import {TranslationParameters, TranslationsStateKey} from "./types";
import {useEffect, useState} from "react";

export const useTranslate = () => {
    const context = usePolygloatContext();
    const [translated, setTranslated] = useState({});
    const [wasInstant, setWasInstant] = useState(false);

    const parseJsonKey = (jsonKey): TranslationsStateKey => {
        return JSON.parse(jsonKey);
    }

    const getJsonKey = (source: string, parameters: TranslationParameters, noWrap: boolean) => {
        return JSON.stringify({source: source, parameters, noWrap});
    }

    const translationFromState = (source: string, parameters: TranslationParameters, noWrap: boolean) => {
        let jsonKey = getJsonKey(source, parameters, noWrap);

        if (translated[jsonKey] === undefined) {
            translated[jsonKey] = context.polygloat.instant(source, parameters, noWrap, true)
            setTranslated({...translated});
            setWasInstant(true);
        }

        return translated[jsonKey];
    }

    useEffect(() => {
        if (wasInstant) {
            translateAll();
        }
        setWasInstant(false);
    }, [wasInstant])


    const translateAll = () => {
        const transactionPremises = Object.entries(translated).map(([jsonKey, _]) => {
            const params = parseJsonKey(jsonKey);
            return new Promise(resolve => {
                context.polygloat.translate(params.source, params.parameters, params.noWrap)
                    .then(translated => resolve({jsonKey, translated}));
            });
        });

        Promise.all(transactionPremises).then((result) => {
            const newTranslated = result.reduce(
                (newTranslated: object, current: any) => {
                    return {...newTranslated, [current.jsonKey]: current.translated}
                }, {}) as object;
            setTranslated({...translated, ...newTranslated});
        });
    }

    useEffect(() => {
        translateAll();

        const subscription = context.polygloat.onLangChange.subscribe(() => translateAll());

        return () => subscription.unsubscribe();

    }, [])

    return (source: string, parameters?: TranslationParameters, noWrap?: boolean) => translationFromState(source, parameters, noWrap);
}