import React from'react'
import Header from '../components/Header'
import {useNavigate} from "react-router-dom";

const Main = ({onLogout}) =>{

    const navigate = useNavigate()
    const handleLogout = ()=>{
        console.log(localStorage.getItem('token'))
        onLogout()
        console.log(localStorage.getItem('token'))
        navigate('/')
    }

    return(
        <div className={'home_container'}>
            <Header />
            {/* <button onClick={handleLogout}>Sign out</button> */}
            
            <div>
                <p className={'notice'}>
                    <strong>Data protection statement</strong><br></br>
                    At Bloggerino, we take the protection of your personal data very seriously. This data protection statement sets out how we collect, process, and use your personal data when you visit and use our site.
                    
                    Collection of Personal Data
                    When you use our blog posting site, we collect personal data from you. This may include your name, email address, IP address, and other information that you provide to us through the site.

                    Use of Personal Data
                    We use your personal data to provide you with access to our blog posting site and to improve our services. We may also use your personal data to send you information about our products and services, as well as to personalize your experience on our site.

                    Sharing of Personal Data
                    We do not share your personal data with third parties, except as required by law or with your consent.

                    Cookies
                    We use cookies to improve the performance of our site and to provide you with a better user experience. Cookies are small files that are placed on your computer or device when you visit our site. You can disable cookies through your browser settings.

                    Security
                    We take appropriate measures to protect your personal data against unauthorized access, loss, or alteration. We also require our employees and service providers to adhere to strict data protection standards.

                    Your Rights
                    You have the right to access, correct, or delete your personal data at any time. You can also object to the processing of your personal data or withdraw your consent. To exercise your rights, please contact us using the contact information provided on our site.

                    By using our blog posting site, you consent to the collection, processing, and use of your personal data in accordance with this data protection statement. We may update this statement from time to time, so please check back periodically for any changes.
                </p>
            </div>
        </div>
    )

}

export default Main;