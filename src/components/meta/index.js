import { useRouter } from 'next/router';
import Head          from "next/head";
import Api           from 'api/requests';

import { useEffect }   from 'react';
import { useSelector } from 'react-redux';
import { generateUniqueId } from 'utils/functions';

const MetaTags = (props) => {

    const metaTags = useSelector(store => store.metaTags);
    const objectId = 'whatever';

    useEffect(() => {
        !props && Api.getMetaTags({payload:{route:'home', objectId:objectId}});
    }, []);


    const renderTags = () => {
        let tagsArr = [];
        let key = generateUniqueId();
        let tagsToUse = props.tags ? props.tags : metaTags;
        for(let name in tagsToUse) {
            tagsArr.push(<meta key={ key } name={ name } content={ tagsToUse[name] } />)
        }
        return tagsArr;
    }

    return (
        <Head>
            { renderTags() }
        </Head>
    )
}

export default MetaTags;