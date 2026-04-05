import { createLink, useMatches } from '@tanstack/react-router'

import { logout } from 'backend/authentication'
import { useCurrentUser } from 'services/users'

import MenuButton from 'libraries/formsV2/components/MenuButton'
import { AnchorButton, Button } from 'libraries/ui'
import { Breadcrumb, BreadcrumbsContainer } from 'libraries/ui/Breadcrumbs'
import { Person as User } from 'libraries/ui/icons'
import { useT, useTranslation } from 'i18n'
import { useDimensionCssVariables } from 'utils/useDimensionCssVariables'

import { NavigateButton } from './widgets/NavigateButton'

function Navigation() {
  const ref = useDimensionCssVariables('page-navbar')
  const T = useT('')
  const matches = useMatches()
  const breadcrumbs = matches
    .map(route => route.staticData?.breadcrumb ? ({ route, breadcrumb: route.staticData.breadcrumb }) : null)
    .filter(r => r !== null)

  return <nav ref={ref} className="flex relative z-10 flex-wrap justify-between items-center px-3.5 h-auto bg-white shadow-sm min-h-12.5 shadow-stone-600/30">
    <div className="grow">
      <BreadcrumbsContainer label={useTranslation('navigation.breadcrumbs')}>
        {breadcrumbs.map(({ route, breadcrumb }) =>
          typeof breadcrumb === 'function'
            ? renderComponent(breadcrumb, route.id)
            : (
              <Breadcrumb
                key={route.id}
                to={route.pathname}
                params={route.params}
                text={T(breadcrumb)}
              />
            ),
        )}
      </BreadcrumbsContainer>
    </div>
    <div className="flex items-center">
      <NavButton requireRight="dances:list" icon={<span className="mr-0.5">💃</span>} to="/dances" text={useTranslation('navigation.dances')} />
      <div className="self-stretch mx-1 w-[1px] bg-stone-300" />
      <LoginStatus />
    </div>
  </nav>
}

const renderComponent = (Crumb: () => React.ReactNode, key: string) => <Crumb key={key} />

const NavButton = createLink((props: React.ComponentProps<typeof AnchorButton>) => <AnchorButton minimal {...props} className="" />)

function LoginStatus() {
  const user = useCurrentUser()
  const t = useT('navigation')

  if (user) {
    return <span>
      <MenuButton
        text={user.name}
        buttonRenderer={props =>
          <Button minimal icon={<User className="mr-0.5 text-amber-600 mt-[1px]" />} {...props} />
        }
      >
        <MenuButton.ItemLink to="/users" text={t('userSettings')} />
        <MenuButton.ItemLink to="/volunteers" text={t('volunteers')} />
        <MenuButton.ItemButton onClick={logout} text={t('logout')} />
      </MenuButton>
    </span>
  }

  return <NavigateButton
    minimal
    to="/login"
    icon={<User className="text-orange-500 mt-[1px]" />}
    text={t('login')}
  />
}

export default Navigation
