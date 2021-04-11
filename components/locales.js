import { useState } from 'react'
import { i18n, Link, withTranslation } from '../i18n'
import styles from '../styles/locales.less'
import classNames from 'classnames/bind'
const cx = classNames.bind(styles)

const Language = ({ t, isToggle }) =>{
    const [languageText, setLanguageText] = useState(t('languageTextEN'));
    const changeLanguage = (value) => {
        i18n.changeLanguage(value)
        value == 'cn'  && setLanguageText(t('languageTextCN'))
        value == 'en' && setLanguageText(t('languageTextEN'))
    }
    return (
        <div className={cx(styles.locales, { hide: !isToggle })}>
            <span>{languageText}<i></i></span>
            <ul>
                <li onClick={() => changeLanguage('en')} >{t('languageTextEN')}</li>
                <li onClick={() => changeLanguage('cn')} >{t('languageTextCN')}</li>
            </ul>
        </div>
    )
}

export default withTranslation('header')(Language)