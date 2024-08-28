package com.ericsson.flowautomationui.spec.FlowsContextButtonsSpec

import com.ericsson.flowautomationui.pagemodel.page.CatalogPage
import com.ericsson.flowautomationui.spec.BaseSpecification
import org.jboss.arquillian.graphene.page.Page
import org.jboss.arquillian.spock.ArquillianSputnik
import org.junit.Ignore
import org.junit.runner.RunWith

import static com.ericsson.flowautomationui.pagemodel.fragment.ImportFlowDialogFragment.CANCEL
import static com.ericsson.flowautomationui.pagemodel.fragment.ImportFlowDialogFragment.OK
import static com.ericsson.flowautomationui.pagemodel.page.CatalogPage.IMPORT
import static com.ericsson.flowautomationui.utils.FlowAutomationConstants.EMPTY_ZIP_ERROR
import static com.ericsson.flowautomationui.utils.FlowAutomationConstants.EXECUTION_PHASE_MISSING_ERROR
import static com.ericsson.flowautomationui.utils.FlowAutomationConstants.FLOW_PACKAGE_REQUIRED
import static com.ericsson.flowautomationui.utils.FlowAutomationConstants.FLOW_VERSION_NOT_ALLOWED_ERROR
import static com.ericsson.flowautomationui.utils.FlowAutomationConstants.IMPORT_FAILED_ERROR
import static com.ericsson.flowautomationui.utils.FlowAutomationConstants.INVALID_FLOW_DEFINITION_ERROR
import static com.ericsson.flowautomationui.utils.FlowAutomationConstants.INVALID_FLOW_PACKAGE_STRUCTURE_ERROR
import static com.ericsson.flowautomationui.utils.FlowAutomationConstants.INVALID_FLOW_VERSION_SYNTAX_ERROR
import static com.ericsson.flowautomationui.utils.FlowAutomationConstants.MISSING_FLOW_DEFINITION_JSON_ERROR
import static com.ericsson.flowautomationui.utils.FlowAutomationConstants.ONLY_ZIP_FILES_ALLOWED
import static com.ericsson.flowautomationui.utils.FlowAutomationConstants.SELECT_FLOW_PKG
import static com.ericsson.flowautomationui.utils.FlowAutomationConstants.SYSTEM_ERROR_PACKAGE
import static com.ericsson.flowautomationui.utils.FlowAutomationConstants.UNAUTHORIZED_TO_IMPORT_FLOW_ERROR
import static com.ericsson.flowautomationui.utils.FlowAutomationConstants.UNEXPECTED_PARSING_DEF_ERROR
import static com.ericsson.flowautomationui.utils.FlowAutomationConstants.UNEXPECTED_PARSING_RESOURCE_ERROR
import static com.ericsson.flowautomationui.utils.FlowAutomationConstants.VALIDATE_ZIP_ERROR

@RunWith(ArquillianSputnik)
class ImportFlowsSpec extends BaseSpecification {

    @Page
    CatalogPage catalogPage

    def "The flow automation main page is open"() {
        setup: "flow automation is running"
        openFlowCatalogUrl()
        catalogPage.isTopsectionVisible()
        catalogPage.verifyTopSectionTitle(CatalogPage.TITLE)
    }

    def "select Import Flow button and import a flow"() {
        given: "Imported Flows Table is visible"
        catalogPage.tableFragment.getTable()

        when: "Select Import Flow button"
        catalogPage.actionBarFragment.clickActionBarButton(CatalogPage.IMPORT_LINK_BUTTON)

        then: "Verify the header of dialog box is correct"
        catalogPage.isDialogBoxDisplayed()
        catalogPage.importFlowDialogFragment.getDialogBoxHeading() == SELECT_FLOW_PKG
        catalogPage.selectFile(driver, "GAT-flow-package.zip")

        when: "Import dialog button is clicked and no file selected"
        catalogPage.importFlowDialogFragment.clickActionButton(IMPORT)

        then: "Verify flow package required error msg displayed"
        catalogPage.notificationFragment.isNotificationDisplayed()
        catalogPage.notificationFragment.getNotificationText().contains("Flow imported successfully")
    }

    def "select Import Flow button and import a Flow that's not in zip format"() {
        given: "Imported Flows Table is visible"
        catalogPage.tableFragment.getTable()

        when: "Select Import Flow button"
        catalogPage.actionBarFragment.clickActionBarButton(CatalogPage.IMPORT_LINK_BUTTON)

        then: "Verify the header of dialog box is correct"
        catalogPage.isDialogBoxDisplayed()
        catalogPage.importFlowDialogFragment.getDialogBoxHeading() == SELECT_FLOW_PKG

        when: "a Flow that's not in zip format is selected"
        catalogPage.selectFile(driver, "GAT-flow-package.txt")

        and: "Import dialog button is clicked"
        catalogPage.importFlowDialogFragment.clickActionButton(IMPORT)

        then: "Verify flow package required error msg displayed"
        assert catalogPage.importFlowDialogFragment.getDisplayedErrorMessage() == ONLY_ZIP_FILES_ALLOWED

        and: "Close dialog box"
        catalogPage.importFlowDialogFragment.clickActionButton(CANCEL)
    }

    def "select Import Flow button and import a Flow that causes a user error"() {
        given: "Imported Flows Table is visible"
        catalogPage.tableFragment.getTable()

        when: "Select Import Flow button"
        catalogPage.actionBarFragment.clickActionBarButton(CatalogPage.IMPORT_LINK_BUTTON)

        then: "Verify the header of dialog box is correct"
        catalogPage.isDialogBoxDisplayed()
        catalogPage.importFlowDialogFragment.getDialogBoxHeading() == SELECT_FLOW_PKG

        when: "a Flow that causes a user error is selected"
        catalogPage.selectFile(driver, "InlineErrorFlow.zip")

        and: "Import dialog button is clicked"
        catalogPage.importFlowDialogFragment.clickActionButton(IMPORT)

        then: "Verify missing flow-definition.json file msg displayed"
        assert catalogPage.importFlowDialogFragment.getDisplayedErrorMessage() == MISSING_FLOW_DEFINITION_JSON_ERROR

        when: "a Flow that causes a parsing error is selected"
        catalogPage.selectFile(driver, "UnexpectedParsingErrorFlow.zip")

        and: "Import dialog button is clicked"
        catalogPage.importFlowDialogFragment.clickActionButton(IMPORT)

        then: "Verify unexpected parsing flow definition error msg displayed"
        assert catalogPage.importFlowDialogFragment.getDisplayedErrorMessage() == UNEXPECTED_PARSING_DEF_ERROR

        when: "a Flow that causes a deployment failed"
        catalogPage.selectFile(driver, "DeploymentFailed.zip")

        and: "Import dialog button is clicked"
        catalogPage.importFlowDialogFragment.clickActionButton(IMPORT)

        then: "Verify failed to import message displayed"
        assert catalogPage.importFlowDialogFragment.getDisplayedErrorMessage() == IMPORT_FAILED_ERROR

        when: "a Flow that causes and unexpected parsing resource error"
        catalogPage.selectFile(driver, "ParsingFlowError.zip")
        and: "Import dialog button is clicked"
        catalogPage.importFlowDialogFragment.clickActionButton(IMPORT)

        then: "Verify unexpected parsing flow error message displayed"
        assert catalogPage.importFlowDialogFragment.getDisplayedErrorMessage() == UNEXPECTED_PARSING_RESOURCE_ERROR

        when: "a Flow with an empty zip error"
        catalogPage.selectFile(driver, "EmptyZip.zip")

        and: "Import dialog button is clicked"
        catalogPage.importFlowDialogFragment.clickActionButton(IMPORT)

        then: "Verify empty zip error displayed"
        assert catalogPage.importFlowDialogFragment.getDisplayedErrorMessage() == EMPTY_ZIP_ERROR


        when: "Import an invalid zip"
        catalogPage.selectFile(driver, "FailedToValidate.zip")

        and: "Import dialog button is clicked"
        catalogPage.importFlowDialogFragment.clickActionButton(IMPORT)

        then: "Verify failed to validate zip error displayed"
        assert catalogPage.importFlowDialogFragment.getDisplayedErrorMessage() == VALIDATE_ZIP_ERROR

        when: "Import a flow with invalid version"
        catalogPage.selectFile(driver, "InvalidVersionSyntax.zip")

        and: "Import dialog button is clicked"
        catalogPage.importFlowDialogFragment.clickActionButton(IMPORT)

        then: "Verify failed to validate zip error displayed"
        assert catalogPage.importFlowDialogFragment.getDisplayedErrorMessage() == INVALID_FLOW_VERSION_SYNTAX_ERROR

        //8
        when: "Import a flow with flow version not allowed"
        catalogPage.selectFile(driver, "FlowVersionNotAllowed.zip")

        and: "Import dialog button is clicked"
        catalogPage.importFlowDialogFragment.clickActionButton(IMPORT)

        then: "Verify invalid flow version error displayed"
        assert catalogPage.importFlowDialogFragment.getDisplayedErrorMessage() == FLOW_VERSION_NOT_ALLOWED_ERROR

        when: "Import a flow with invalid flow definition json"
        catalogPage.selectFile(driver, "InvalidFlowDefJson.zip")

        and: "Import dialog button is clicked"
        catalogPage.importFlowDialogFragment.clickActionButton(IMPORT)

        then: "Verify invalid flow definition error displayed"
        assert catalogPage.importFlowDialogFragment.getDisplayedErrorMessage() == INVALID_FLOW_DEFINITION_ERROR

        when: "Import a flow with invalid flow package structure"
        catalogPage.selectFile(driver, "InvalidFlowPkgStructure.zip")

        and: "Import dialog button is clicked"
        catalogPage.importFlowDialogFragment.clickActionButton(IMPORT)

        then: "Verify invalid flow package structure error displayed"
        assert catalogPage.importFlowDialogFragment.getDisplayedErrorMessage() == INVALID_FLOW_PACKAGE_STRUCTURE_ERROR

        when: "Import a flow with Execution Phase missing"
        catalogPage.selectFile(driver, "MissingExecutePhase.zip")

        and: "Import dialog button is clicked"
        catalogPage.importFlowDialogFragment.clickActionButton(IMPORT)

        then: "Verify missing execute phase error is displayed"
        assert catalogPage.importFlowDialogFragment.getDisplayedErrorMessage() == EXECUTION_PHASE_MISSING_ERROR

        when: "Import a flow when user does not have permission"
        catalogPage.selectFile(driver, "UnauthorizedFlow.zip")

        and: "Import dialog button is clicked"
        catalogPage.importFlowDialogFragment.clickActionButton(IMPORT)

        then: "Verify Unauthorized error is displayed"
        assert catalogPage.importFlowDialogFragment.getDisplayedErrorMessage() == UNAUTHORIZED_TO_IMPORT_FLOW_ERROR

        and: "Close dialog box"
        catalogPage.importFlowDialogFragment.clickActionButton(CANCEL)
    }

    def "select Import Flow button and import a Flow that causes a system error"() {

        when: "Select Import Flow button"
        catalogPage.actionBarFragment.clickActionBarButton(CatalogPage.IMPORT_LINK_BUTTON)

        then: "Verify the header of dialog box is correct"
        catalogPage.isDialogBoxDisplayed()
        catalogPage.importFlowDialogFragment.getDialogBoxHeading() == SELECT_FLOW_PKG

        when: "a Flow that's not in zip format is selected"
        catalogPage.selectFile(driver, "SystemErrorFlow.zip")

        then: "Import dialog button is clicked"
        catalogPage.importFlowDialogFragment.clickActionButton(IMPORT)

        and: "system error dialog appears"
        catalogPage.importFlowDialogFragment.getDialogBoxHeading() == SYSTEM_ERROR_PACKAGE

        when: "Close error dialog box"
        catalogPage.importFlowDialogFragment.clickActionButton(OK)

        and: "an invalid Flow that returns response not in json"
        catalogPage.selectFile(driver, "SystemErrorInvalidJsonInResponse.zip")

        then: "Import dialog button is clicked"
        catalogPage.importFlowDialogFragment.clickActionButton(IMPORT)

        and: "system error dialog appears"
        catalogPage.importFlowDialogFragment.getDialogBoxHeading() == SYSTEM_ERROR_PACKAGE

        when: "Close error dialog box"
        catalogPage.importFlowDialogFragment.clickActionButton(OK)

        then: "Close import dialog box"
        catalogPage.importFlowDialogFragment.clickActionButton(CANCEL)

    }

    def "select Import Flow button and import without a file selected"() {
        when: "Select Import Flow button"
        catalogPage.actionBarFragment.clickActionBarButton(CatalogPage.IMPORT_LINK_BUTTON)

        then: "Verify the header of dialog box is correct"
        catalogPage.isDialogBoxDisplayed()
        catalogPage.importFlowDialogFragment.getDialogBoxHeading() == SELECT_FLOW_PKG

        when: "Import dialog button is clicked and no file selected"
        catalogPage.importFlowDialogFragment.clickActionButton(IMPORT)

        then: "Verify flow package required error msg displayed"
        assert catalogPage.importFlowDialogFragment.getDisplayedErrorMessage() == FLOW_PACKAGE_REQUIRED
        catalogPage.importFlowDialogFragment.clickActionButton(CANCEL)
    }
}
