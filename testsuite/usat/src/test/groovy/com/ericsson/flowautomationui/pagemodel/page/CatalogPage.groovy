package com.ericsson.flowautomationui.pagemodel.page

import com.ericsson.flowautomationui.pagemodel.fragment.ActionBarFragment
import com.ericsson.flowautomationui.pagemodel.fragment.FlowSummaryFragment
import com.ericsson.flowautomationui.pagemodel.fragment.ImportFlowDialogFragment
import com.ericsson.flowautomationui.pagemodel.fragment.NotificationFragment
import com.ericsson.flowautomationui.pagemodel.fragment.StartInstanceDialogFragment
import com.ericsson.flowautomationui.pagemodel.fragment.TableFragment
import com.ericsson.flowautomationui.pagemodel.fragment.TableSettingsFragment
import org.openqa.selenium.By
import org.openqa.selenium.WebDriver
import org.openqa.selenium.WebElement
import org.openqa.selenium.support.FindBy

class CatalogPage extends BasePage {

    public static final String TITLE = "Flow Catalog"

    public static final String ENABLE_BUTTON = "Enable"
    public static final String DISABLE_BUTTON = "Disable"
    public static final String IMPORT_LINK_BUTTON = "Import Flow"
    public static final String IMPORT = "Import"

    @FindBy(className = "elTablelib-Table")
    TableFragment tableFragment

    @FindBy(className = "elLayouts-QuickActionBar")
    ActionBarFragment actionBarFragment

    @FindBy(className = "eaFlowCatalog-rFlowSummary")
    FlowSummaryFragment flowSummaryFragment

    @FindBy(className = "eaContainer-applicationHolder")
    NotificationFragment notificationFragment

    @FindBy(className = "eaFlowAutomationLib-tableSettings")
    TableSettingsFragment tableSettingsFragement

    @FindBy(className = "eaFlyout")
    WebElement flyoutPanel

    @FindBy(className = "ebDialogBox")
    WebElement dialogBox

    @FindBy(className = "ebDialog-holder")
    ImportFlowDialogFragment importFlowDialogFragment

    @FindBy(className = "ebDialog-holder")
    StartInstanceDialogFragment startDialogFragment

    @FindBy(className = "ebComponentList-item")
    List<WebElement> rightClickOptions

    void clickOutSideFlyout() {
        click(topSectionTitle)
    }

    void rightClickOnOption(String name) {
        for (WebElement option : rightClickOptions) {
            if (name == option.getAttribute("innerText")) {
                option.click()
                break
            }
        }
    }

    boolean isRightClickMenuAvailable(WebDriver driver) {
        List<WebElement> rightClickMenu = driver.findElements(By.className("elWidgets-ComponentList"))
        return rightClickMenu.size() > 0
    }

    boolean compareTableFilteredRows(String filterText) {
        return tableFragment.getColumnValues(1).findAll {
            !it.toLowerCase().contains(filterText.toLowerCase())
        }
    }

    boolean isDialogBoxDisplayed() {
        return waitVisible(dialogBox).isDisplayed()
    }

    WebElement isFlyoutPanelVisible() {
        return waitVisible(flyoutPanel)
    }

    def compareSortedFlows(List<String> flows) {
        return flows == tableFragment.getColumnValues(1)
    }

}
