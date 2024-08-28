package com.ericsson.flowautomationui.spec.FlowsContextButtonsSpec

import com.ericsson.flowautomationui.pagemodel.fragment.NotificationFragment
import com.ericsson.flowautomationui.pagemodel.page.CatalogPage
import com.ericsson.flowautomationui.spec.BaseSpecification
import org.jboss.arquillian.graphene.page.Page
import org.jboss.arquillian.spock.ArquillianSputnik
import org.junit.runner.RunWith

import static com.ericsson.flowautomationui.pagemodel.page.CatalogPage.DISABLE_BUTTON

@RunWith(ArquillianSputnik)
class DisableEnableFlowSpec extends BaseSpecification {

    @Page
    CatalogPage catalogPage

    def "The flow automation main page is open"() {
        setup: "flow automation is running"
        openFlowCatalogUrl()
        catalogPage.isTopsectionVisible()
        catalogPage.verifyTopSectionTitle(CatalogPage.TITLE)
    }

    def "Disable and enable a Flow"() {
        given: "Imported Flows Table is visible"
        catalogPage.tableFragment.getTable()

        when: "select a flow and disable it"
        catalogPage.tableFragment.clickRow(2)
        catalogPage.actionBarFragment.clickActionBarButton(DISABLE_BUTTON)

        then: "Flow disabled successfully with Notification appearing and disappearing"
        NotificationFragment notificationFragment = catalogPage.notificationFragment
        notificationFragment.isNotificationDisplayed()
        notificationFragment.getNotificationText().contains("Flow disabled successfully")

        and: "disable button is not present"
        !catalogPage.actionBarFragment.clickActionBarButton(DISABLE_BUTTON)

        when: "enable button is clicked"
        catalogPage.actionBarFragment.clickActionBarButton(CatalogPage.ENABLE_BUTTON)

        then: "Flow enabled successfully with Notification appearing and disappearing"
        notificationFragment.isNotificationDisplayed()
        notificationFragment.getNotificationText().contains("Flow enabled successfully")
    }
}
