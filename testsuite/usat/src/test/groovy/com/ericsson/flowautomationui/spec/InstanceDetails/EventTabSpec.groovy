package com.ericsson.flowautomationui.spec.InstanceDetails

import com.ericsson.flowautomationui.pagemodel.fragment.EventTabFragment
import com.ericsson.flowautomationui.pagemodel.fragment.StartInstanceDialogFragment
import com.ericsson.flowautomationui.pagemodel.page.InstanceDetailsPage
import com.ericsson.flowautomationui.pagemodel.page.InstancesPage
import com.ericsson.flowautomationui.spec.BaseSpecification
import org.jboss.arquillian.graphene.page.Page
import org.jboss.arquillian.spock.ArquillianSputnik
import org.junit.runner.RunWith

@RunWith(ArquillianSputnik)
class EventTabSpec extends BaseSpecification {

    public static final String EVENTS = "Events"

    @Page
    InstancesPage instancesPage

    @Page
    InstanceDetailsPage instanceDetailsPage

    @Page
    EventTabFragment eventTabFragment

    @Page
    StartInstanceDialogFragment dialogFragment


    def "verify if open the event tab"() {
        setup: "flow automation is running"
        openFlowAutomationUrl()
        instancesPage.isTopsectionVisible()

        when: "unselect my flow instances"
        instancesPage.clickMyInstances()

        then: "when table is visible"
        instancesPage.instancesTableFragment.getTable()

        when: "click on an instance in the table"
        instancesPage.instancesTableFragment.selectRow("0taski")

        and: "click on the flow instance details button"
        instancesPage.actionBarFragment.clickActionBarButton("View Instance Details")

        then: "Verify top section"
        instancesPage.verifyTopSectionTitle("Flow Instance Details")

        when:
        instanceDetailsPage.selectedTabIsCorrect(EVENTS)

        then:
        instanceDetailsPage.correctVisibleTabs("Report", "User Tasks", "Process Diagram", EVENTS)

    }


    def "verify events details open"() {
        when:
        instanceDetailsPage.selectTabByName(EVENTS)

        then:
        eventTabFragment.verifyTitle(EVENTS)
    }

}


