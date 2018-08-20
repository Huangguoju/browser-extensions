import * as React from 'react'
import { RouteComponentProps } from 'react-router'
import { Subscription } from 'rxjs'
import * as permissions from '../../../extension/permissions'
import storage from '../../../extension/storage'
import { StorageItems } from '../../../extension/types'
import * as GQL from '../../backend/graphqlschema'
import { fetchCurrentUser } from '../../backend/server'
import { ConnectionCard } from './ConnectionCard'
import { FeatureFlagCard } from './FeatureFlagCard'

interface Props extends RouteComponentProps<any> {}
interface State {
    currentUser: GQL.IUser | undefined
    storage: StorageItems | undefined
    permissionOrigins: string[]
}

/**
 * A page displaying an overview of the extension configuration state.
 */
export class OptionsConfiguration extends React.Component<Props, State> {
    private subscriptions = new Subscription()

    constructor(props: Props) {
        super(props)
        this.state = {
            storage: undefined,
            currentUser: undefined,
            permissionOrigins: [],
        }
    }

    public componentDidMount(): void {
        fetchCurrentUser().subscribe(user => {
            this.setState(() => ({ currentUser: user }))
        })
        storage.onChanged(() => {
            this.updateForStorageItems()
        })
        permissions.onAdded(() => {
            this.updateForPermissions()
        })
        permissions.onRemoved(() => {
            this.updateForPermissions()
        })
        this.updateForStorageItems()
        this.updateForPermissions()
    }

    private updateForStorageItems = () => {
        storage.getSync(items => {
            this.setState(() => ({ storage: items }))
        })
    }

    private updateForPermissions = () => {
        permissions.getAll().then(
            permissions => {
                this.setState(() => ({ permissionOrigins: permissions.origins || [] }))
            },
            () => {
                /** noop */
            }
        )
    }

    public componentWillUnmount(): void {
        this.subscriptions.unsubscribe()
    }

    public render(): JSX.Element | null {
        const { storage, currentUser, permissionOrigins } = this.state
        if (!storage) {
            return null
        }
        return (
            <div className="options-configuation-page">
                <ConnectionCard permissionOrigins={permissionOrigins} storage={storage} currentUser={currentUser} />
                <FeatureFlagCard storage={storage} />
            </div>
        )
    }
}
