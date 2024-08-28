package com.ericsson.flowautomationui.pagemodel.page

import com.ericsson.flowautomationui.pagemodel.fragment.ActionBarFragment
import com.ericsson.flowautomationui.pagemodel.fragment.FlowInstanceStatisticsFragment
import com.ericsson.flowautomationui.pagemodel.fragment.ImportFlowDialogFragment
import com.ericsson.flowautomationui.pagemodel.fragment.StartInstanceDialogFragment
import com.ericsson.flowautomationui.pagemodel.fragment.InstanceDialogFragment
import com.ericsson.flowautomationui.pagemodel.fragment.TableFragment
import com.ericsson.flowautomationui.pagemodel.fragment.TableSettingsFragment
import com.ericsson.flowautomationui.pagemodel.fragment.TitleAndFiltersFragment
import org.jboss.arquillian.graphene.page.Page
import org.openqa.selenium.WebElement
import org.openqa.selenium.support.FindBy

class InstancesPage extends BasePage {

    public static final String TITLE = "Flow Automation"

    @FindBy(className = "eaFlyout")
    private WebElement flyoutPanel

    @FindBy(className = "ebDialogBox")
    private WebElement dialogBox

    @FindBy(className = "ebInlineMessage-header")
    private WebElement instanceWarning

    @FindBy(className = "eaFlowAutomation-rInstances-myInstances-button")
    private WebElement myInstancesButton

    @FindBy(className = "ebBreadcrumbs-link")
    private List<WebElement> listBreadCrumbsInstances

    @FindBy(className = "eaFlowAutomation-rFlows-catalogLink")
    private WebElement catalogLink

    @Page
    TitleAndFiltersFragment titleAndFiltersFragment

    @FindBy(className = "elLayouts-QuickActionBar")
    ActionBarFragment actionBarFragment

    @FindBy(className = "eaFlowAutomation-statisticsHolder")
    FlowInstanceStatisticsFragment flowInstanceStatisticsFragment

    @FindBy(className = "ebDialog-holder")
    ImportFlowDialogFragment importFlowDialogFragment

    @FindBy(className = "eaFlowAutomation-rInstances-tableHolder")
    TableFragment instancesTableFragment

    @FindBy(className = "eaFlowAutomation-rFlows-flowList")
    TableFragment flowsTableFragment

    @FindBy(className = "eaFlowAutomationLib-tableSettings")
    TableSettingsFragment tableSettingsFragement

    @FindBy(className = "ebDialog-holder")
    StartInstanceDialogFragment startDialogFragment

    @Page
    InstanceDialogFragment deleteInstanceDialogFragment

    @Page
    InstanceDialogFragment stopInstanceDialogFragment

    boolean isDialogBoxDisplayed() {
        return waitVisible(dialogBox).isDisplayed()
    }

    void openFlowAutomationBreadCrumb() {
        click(listBreadCrumbsInstances.get(1))
        sleep(2000)
        isTopsectionVisible()
        verifyTopSectionTitle(TITLE)
    }

    WebElement isFlyoutPanelVisible() {
        return waitVisible(flyoutPanel)
    }

    def verifyTextInstanceWarning(String text) {
        return getText(instanceWarning) == text
    }

    void clickMyInstances() {
        click(myInstancesButton)
    }

    def clickCatalogLink() {
        click(catalogLink)
    }
}
